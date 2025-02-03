@Injectable()
export class RefundHometaxService {
constructor(
private readonly tilcoService: TilcoService,
private readonly supabaseRefund: SupabaseRefundService,
@InjectRepository(BusinessClosure)
private readonly businessClosureRepository: Repository<BusinessClosure>,
@InjectRepository(BusinessRegistration)
private readonly businessRegistrationRepository: Repository<BusinessRegistration>,
) {}

async processHometaxData(hometaxAuth: SimpleAuthData, userId: string) {
const currentYear = new Date().getFullYear();
const businessesResult = await this.tilcoService.myBusinessRegisterSearch(hometaxAuth);

    // 영업 중인 사업자번호와 폐업한 사업자번호를 저장할 배열
    const activeBusinessNumbers: string[] = [];
    const closedBusinessNumbers: string[] = [];

    // 사업자 상태에 따라 분류
    businessesResult.Result.forEach((business) => {
      const businessNumber = business.txprDscmNoEncCntn;

      if (business.txprStatNm === '영업') {
        activeBusinessNumbers.push(businessNumber);
      } else if (business.txprStatNm === '폐업') {
        closedBusinessNumbers.push(businessNumber);
      }
    });

    const tasks = [];

    // 폐업 사업자 처리 태스크 추가
    if (closedBusinessNumbers.length > 0) {
      tasks.push(this.processClosedBusinesses(closedBusinessNumbers, userId, hometaxAuth));
    }

    // 영업 중인 사업자 처리 태스크 추가
    if (activeBusinessNumbers.length > 0) {
      tasks.push(this.processActiveBusinesses(activeBusinessNumbers, userId, hometaxAuth));
    }

    // 전자신고 데이터 처리 태스크 추가
    const allBusinessNumbers = [...activeBusinessNumbers, ...closedBusinessNumbers];
    if (allBusinessNumbers.length > 0) {
      tasks.push(this.processElectronicDeclarations(allBusinessNumbers, userId, currentYear - 5, currentYear - 1, hometaxAuth));
    }

    // 모든 태스크 병렬 실행
    try {
      await Promise.all(tasks);
      console.log('모든 데이터 처리 완료');
    } catch (error) {
      console.error('데이터 처리 중 오류 발생:', error);
      throw error;
    }

}

private async processClosedBusinesses(
businessNumbers: string[],
userId: string,
authData: SimpleAuthData,
) {
for (const businessNo of businessNumbers) {
const result = await this.tilcoService.getBusinessClosureInfo(
userId,
businessNo,
authData,
);

      for (const closureInfo of result.Result) {
        if (closureInfo.PdfData) {
          await Promise.all([
            this.supabaseRefund.uploadPdfToStorage(
              closureInfo.PdfData,
              userId,
              `business-closure/${closureInfo.BusinessNumber}_business_closure_certificate.pdf`,
            ),
            this.processBusinessClosureData(closureInfo),
          ]);
        }
      }
    }

}

private async processActiveBusinesses(
businessNumbers: string[],
userId: string,
authData: SimpleAuthData,
) {
for (const businessNo of businessNumbers) {
const result = await this.tilcoService.getBusinessRegistration(
userId,
businessNo,
authData,
);

      for (const registrationInfo of result.Result) {
        if (registrationInfo.PdfData) {
          await Promise.all([
            this.supabaseRefund.uploadPdfToStorage(
              registrationInfo.PdfData,
              userId,
              `business-registration/${registrationInfo.BusinessNumber}_business_registration_certificate.pdf`,
            ),
            this.processBusinessRegistrationData(registrationInfo),
          ]);
        }
      }
    }

}

private async processBusinessClosureData(closureInfo: any) {
// PDF 데이터를 제외한 나머지 데이터로 엔티티 생성
const closureEntity = this.businessClosureRepository.create({
businessNumber: closureInfo.BusinessNumber,
// 필요한 다른 필드들 매핑
closureDate: closureInfo.ClosureDate,
businessName: closureInfo.BusinessName,
// ... 기타 필요한 필드
});

    // 데이터베이스에 저장
    return this.businessClosureRepository.save(closureEntity);

}

private async processElectronicDeclarations(
businessNumbers: string[],
userId: string,
startYear: number,
endYear: number,
authData: SimpleAuthData,
) {
const fs = require('fs');
const path = require('path');
const downloadFolder = path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads');

    for (const businessNo of businessNumbers) {
      for (let year = startYear; year <= endYear; year++) {
        try {
          const result = await this.tilcoService.getElectronicDeclaration(
            userId,
            year.toString(),
            businessNo,
            authData,
          );

          if (result && result.Result) {
            const filePath = path.join(
              downloadFolder,
              `${userId}_${year}_electronic_declaration.txt`
            );

            // 결과 데이터를 보기 좋게 포맷팅
            const formattedData = JSON.stringify(result.Result, null, 2);

            // 파일에 데이터 저장
            await fs.promises.writeFile(filePath, formattedData, 'utf8');

            console.log(`전자신고 데이터 저장 완료: ${filePath}`);
          }
        } catch (error) {
          console.error(`전자신고 데이터 처리 실패 - 사업자번호: ${businessNo}, 년도: ${year}`, error);
        }
      }
    }

}

private async processBusinessRegistrationData(registrationInfo: any) {
// PDF 데이터를 제외한 나머지 데이터로 엔티티 생성
const registrationEntity = this.businessRegistrationRepository.create({
businessNumber: registrationInfo.BusinessNumber,
// 필요한 다른 필드들 매핑
registrationDate: registrationInfo.RegistrationDate,
businessName: registrationInfo.BusinessName,
// ... 기타 필요한 필드
});

    // 데이터베이스에 저장
    return this.businessRegistrationRepository.save(registrationEntity);

}
}
