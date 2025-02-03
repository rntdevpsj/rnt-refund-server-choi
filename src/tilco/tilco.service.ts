import { AppException } from './../common/exception/app.exception'
import { HttpApiService } from 'src/common/http/http-api.service'
import { Injectable, Logger } from '@nestjs/common'
import { HttpService as NestHttpService } from '@nestjs/axios'
import * as crypto from 'crypto'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import {
  EmployLoginCheckApiReqData,
  HometaxLoginCheckApiReqData,
} from './reqdata/simple-auth-login-check-api-req.data'
import { SimpleAuthApiReqData } from './reqdata/simple-auth-api-req.data'
import { SimpleHometaxBusinessClosureApiReqData } from './reqdata/simpleHometaxRequest/simple-hometax-business-closure-api-req.data'
import { SimpleHometaxBusinessCertificateApiReqData } from './reqdata/simpleHometaxRequest/simple-hometax-business-certificate-api-req.data'
import { SimpleHometaxElectronicReportApiReqData } from './reqdata/simpleHometaxRequest/simple-hometax-electronic-report-api-req.data'
import { SimpleAuthData } from './resdata/auth-api-res.data'
import { SimpleAuthRequestDto } from 'src/refund/dto/cashnote-request.dto'
import { SimpleEmployBusinessManageNoApiReqData } from './reqdata/simpleEmployRequest/simple-employ-business-manage-no-api-req.data'
import { SimpleEmployBusinessRateApiReqData } from './reqdata/simpleEmployRequest/simple-employ-business-rate-api-req.data'
import { SimpleEmployEmploymentInfoApiReqData } from './reqdata/simpleEmployRequest/simple-employ-employment-info-api-req.data'
import { SimpleEmployTotalSalaryApiReqData } from './reqdata/simpleEmployRequest/simple-employ-total-salary-api-req.data'

@Injectable()
export class TilcoService {
  private readonly logger = new Logger(HttpApiService.name)
  private readonly AES_KEY_LENGTH = 128 // AES-128 사용
  private readonly FIXED_IV = Buffer.alloc(16, 0) // 16바이트(128비트) IV를 0으로 초기화
  private _aesKey: Buffer
  private public_key: string | null = null
  private readonly tilcoHometaxBaseUrl: string
  private readonly tilcoEmployBaseUrl: string

  constructor(
    private readonly httpService: NestHttpService,
    private readonly configService: ConfigService,
    private readonly httpApiService: HttpApiService,
  ) {
    this._aesKey = this.generateAESKey()
    this.tilcoHometaxBaseUrl =
      this.configService.get<string>('TILCO_HOMETAX_URL')
    this.tilcoEmployBaseUrl = this.configService.get<string>('TILCO_EMPLOY_URL')
  }

  // AES Secret Key 생성 (16바이트 = 128비트)
  generateAESKey(): Buffer {
    // return crypto.randomBytes(this.AES_KEY_LENGTH / 8)
    return Buffer.from('1234567890123456', 'utf8')
  }

  get aesKey(): Buffer {
    return this._aesKey
  }

  // RSA로 AES Key 암호화
  encryptAESKey(aesKey: Buffer, rsaPublicKey: string): string {
    try {
      // Base64로 디코딩
      const binaryPublicKey = Buffer.from(rsaPublicKey, 'base64')

      // PEM 형식으로 변환
      const pemKey = `-----BEGIN PUBLIC KEY-----\n${binaryPublicKey.toString('base64')}\n-----END PUBLIC KEY-----`

      const encryptedKey = crypto.publicEncrypt(
        {
          key: pemKey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        aesKey,
      )

      return encryptedKey.toString('base64')
    } catch (error) {
      throw AppException.externalApi(
        'key암호화 실패',
        'system',
        'external-api',
        {
          originalError: error.message,
          statusCode: error.response?.status,
          errorResponse: error.response?.data,
        },
      )
    }
  }

  // 실제 데이터 AES 암호화 (고정 IV 사용)
  encryptData(data: string, aesKey: Buffer): string {
    try {
      const cipher = crypto.createCipheriv('aes-128-cbc', aesKey, this.FIXED_IV)
      let encrypted = cipher.update(data, 'utf8', 'base64')
      encrypted += cipher.final('base64')
      return encrypted
    } catch (error) {
      throw AppException.externalApi(
        '데이터 암호화화 실패',
        'system',
        'external-api',
        {
          originalError: error.message,
          statusCode: error.response?.status,
          errorResponse: error.response?.data,
        },
      )
    }
  }

  // tilco public키 가져오기
  private async getPublicKey(): Promise<string> {
    if (this.public_key) {
      return this.public_key
    }

    const apiKey = this.configService.get<string>('TILCO_API_KEY')
    const url = `${this.tilcoHometaxBaseUrl}/api/Auth/GetPublicKey?APIkey=${apiKey}`
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      )

      this.public_key = response.data.PublicKey
      return this.public_key
    } catch (error) {
      throw AppException.externalApi(
        '공개키확보 실패',
        'system',
        'external-api',
        {
          originalError: error.message,
          statusCode: error.response?.status,
          errorResponse: error.response?.data,
        },
      )
    }
  }

  async getHeaders() {
    try {
      const apiKey = this.configService.get<string>('TILCO_API_KEY')
      const publicKey = await this.getPublicKey()
      const encKey = this.encryptAESKey(this._aesKey, publicKey)

      return {
        'Content-Type': 'application/json',
        'API-KEY': apiKey,
        'ENC-KEY': encKey,
      }
    } catch (error) {
      if (error instanceof AppException) {
        // 하위에서 발생한 external-api-error는 그대로 전파
        throw error
      }
      // 그 외 에러는 system-error로 변환
      throw AppException.system('인증 헤더 생성 실패', 'system', {
        originalError: error.message,
      })
    }
  }

  // api호출입력데이터 암호화시 단순배열, 객체, 중첩객체 사용 가능
  /*
  1. 단순배열
    const requestData = {
      username: "john123",
      password: "mypassword123",
      email: "john@example.com"
    };
    const encryptFields = ["password", "email"];
  2. 객체
    const requestData = {
      Auth: {
        userId: "USER123",
        token: "abc123xyz",
        secretKey: "sk_live_123"
      }
    };
    const encryptFields = {
     auth: ["token", "secretKey"]  // Auth 객체 내부 필드 암호화
    };
    3. 중첩객체
      const requestData = {
        userInfo: "sensitive_data",
        cardNumber: "1234-5678-9012-3456",
        Auth: {
          apiKey: "key_123456",
          signature: "sig_789012"
        }
      };
      const encryptFields = {
        root: ["userInfo", "cardNumber"],  // 최상위 필드 암호화
        auth: ["apiKey", "signature"]      // Auth 객체 내부 필드 암호화
      };
  */
  private async callTilcoApi<Treq>(
    endpoint: string,
    requestData: Treq,
    encryptFields: string[] | { auth?: string[]; root?: string[] },
  ): Promise<any> {
    let requestBody: Treq

    try {
      // 배열 암호화필드 데이터 암호화
      if (Array.isArray(encryptFields)) {
        requestBody = {
          ...requestData,
          ...Object.fromEntries(
            encryptFields.map(field => [
              field,
              this.encryptData(requestData[field], this.aesKey),
            ]),
          ),
        }
      } else {
        // 객체 또는 중첩객체 암호화필드 데이터암호화
        requestBody = {
          ...requestData,
          ...Object.fromEntries(
            (encryptFields.root || []).map(field => [
              field,
              this.encryptData(requestData[field], this.aesKey),
            ]),
          ),
          ...(requestData['Auth'] && {
            Auth: {
              ...requestData['Auth'],
              ...Object.fromEntries(
                (encryptFields.auth || []).map(field => [
                  field,
                  this.encryptData(requestData['Auth'][field], this.aesKey),
                ]),
              ),
            },
          }),
        }
      }

      const headers = await this.getHeaders()
      const response = await this.httpApiService.post<Treq>(
        endpoint,
        requestBody,
        headers,
      )
      return response
    } catch (error) {
      throw AppException.from(
        error,
        'API호출 실패-callTilcoApi',
        'http',
        'external-api',
      )
      //   if (error.isAxiosError) {
      //     throw AppException.externalApi(
      //       `API 호출 실패: ${error.response?.statusText || error.message}`,
      //       'system',
      //       'external-api',
      //       {
      //         endpoint,
      //         statusCode: error.response?.status,
      //         errorResponse: error.response?.data,
      //       },
      //     )
      //   }
      //   throw AppException.system('API 호출 중 시스템 오류', 'system', {
      //     originalError: error.message,
      //   })
    }
  }

  async simpleHometaxAuthRequest(bodyData: SimpleAuthRequestDto): Promise<any> {
    const endApi = '/api/v2.0/HometaxSimpleAuth/SimpleAuthRequest'
    const endpoint = `${this.tilcoHometaxBaseUrl}${endApi}`

    const requestData = {
      IdentityNumber: '',
      BirthDate: bodyData.birthDate,
      PrivateAuthType: '0',
      UserName: bodyData.userName,
      UserCellphoneNumber: bodyData.userCellphoneNumber,
    } as SimpleAuthApiReqData

    try {
      const response = await this.callTilcoApi<SimpleAuthApiReqData>(
        endpoint,
        requestData,
        ['BirthDate', 'UserName', 'UserCellphoneNumber'],
      )

      //홈택스간편인증api 리턴값은 ResultData객체안에 token존재
      return response?.ResultData
    } catch (error) {
      // 하위 레이어의 에러를 현재 맥락에 맞게 재정의
      throw AppException.from(
        error,
        '홈택스간편인증요청 실패',
        'simple-auth-request',
        'hometax-auth',
      )
      // if (error instanceof AppException) {
      //   throw new AppException(
      //     error.errorType,
      //     '홈택스 간편인증요청 실패',
      //     'simple-auth-request', // 현재 프로세스 step
      //     'hometax-auth', // 현재 작업 operation
      //     error.details,
      //   )
      // }
      // throw AppException.system(
      //   '홈택스 간편인증요청 시스템 오류',
      //   'simple-auth-request',
      //   { originalError: error.message },
      // )
    }
  }

  async simpleEmployAuthRequest(bodyData: SimpleAuthRequestDto): Promise<any> {
    const endApi = '/api/v2.0/KcomwelSimpleAuth/SimpleAuthRequest'
    const endpoint = `${this.tilcoEmployBaseUrl}${endApi}`

    const requestData = {
      IdentityNumber: bodyData.identityNumber,
      BirthDate: '',
      PrivateAuthType: '0',
      UserName: bodyData.userName,
      UserCellphoneNumber: bodyData.userCellphoneNumber,
    } as SimpleAuthApiReqData

    try {
      const response = await this.callTilcoApi<SimpleAuthApiReqData>(
        endpoint,
        requestData,
        ['IdentityNumber', 'UserName', 'UserCellphoneNumber'],
      )

      return response?.ResultData
    } catch (error) {
      throw AppException.from(
        error,
        '고용산재 간편인증요청 실패',
        'simple-auth-request',
        'employ-auth',
      )
    }
  }

  async checkHometaxLogin(hometaxAuth: SimpleAuthData): Promise<any> {
    const endApi = '/api/v2.0/HometaxSimpleAuth/LoginCheck'
    const endpoint = `${this.tilcoHometaxBaseUrl}${endApi}`

    const requestData: HometaxLoginCheckApiReqData = {
      Auth: {
        PrivateAuthType: hometaxAuth.PrivateAuthType,
        UserName: hometaxAuth.UserName,
        UserCellphoneNumber: hometaxAuth.UserCellphoneNumber,
        Token: hometaxAuth.Token,
        CxId: hometaxAuth.CxId,
        TxId: hometaxAuth.TxId,
        ReqTxId: hometaxAuth.ReqTxId,
        BirthDate: hometaxAuth.BirthDate,
      },
    }

    try {
      const response = await this.callTilcoApi<HometaxLoginCheckApiReqData>(
        endpoint,
        requestData,
        {
          auth: ['UserName', 'UserCellphoneNumber', 'BirthDate'],
        },
      )

      return response
    } catch (error) {
      throw AppException.from(
        error,
        '홈택스간편인증 확인인요청 실패',
        'auth-verification',
        'login-verify',
      )
    }
  }

  async checkEmployLogin(employAuth: SimpleAuthData): Promise<any> {
    const endApi = '/api/v2.0/KcomwelSimpleAuth/LoginCheck'
    const endpoint = `${this.tilcoEmployBaseUrl}${endApi}`

    const requestData: EmployLoginCheckApiReqData = {
      Auth: {
        PrivateAuthType: employAuth.PrivateAuthType,
        UserName: employAuth.UserName,
        UserCellphoneNumber: employAuth.UserCellphoneNumber,
        Token: employAuth.Token,
        CxId: employAuth.CxId,
        TxId: employAuth.TxId,
        ReqTxId: employAuth.ReqTxId,
        IdentityNumber: employAuth.IdentityNumber,
      },
      UserGroupFlag: '1',
      IndividualFlag: '1',
    }

    try {
      const response = await this.callTilcoApi<EmployLoginCheckApiReqData>(
        endpoint,
        requestData,
        {
          auth: ['UserName', 'UserCellphoneNumber', 'IdentityNumber'],
        },
      )

      return response
    } catch (error) {
      throw AppException.from(
        error,
        '고용산재 간편인증 확인요청 실패',
        'auth-verification',
        'login-verify',
      )
    }
  }

  async myBusinessRegisterSearch(hometaxAuth: SimpleAuthData): Promise<any> {
    const endApi = '/api/v2.0/HometaxSimpleAuth/MyBusinessRegistrations2'
    const endpoint = `${this.tilcoHometaxBaseUrl}${endApi}`

    const requestData: HometaxLoginCheckApiReqData = {
      Auth: {
        PrivateAuthType: hometaxAuth.PrivateAuthType,
        UserName: hometaxAuth.UserName,
        UserCellphoneNumber: hometaxAuth.UserCellphoneNumber,
        Token: hometaxAuth.Token,
        CxId: hometaxAuth.CxId,
        TxId: hometaxAuth.TxId,
        ReqTxId: hometaxAuth.ReqTxId,
        BirthDate: hometaxAuth.BirthDate,
      },
    }

    try {
      const response = await this.callTilcoApi<HometaxLoginCheckApiReqData>(
        endpoint,
        requestData,
        {
          auth: ['UserName', 'UserCellphoneNumber', 'BirthDate'],
        },
      )
      return response
    } catch (error) {
      throw AppException.from(
        error,
        '내사업장조회 실패',
        'hometax-data',
        'my-business-info',
      )
    }
  }

  async getBusinessClosureInfo(
    userId: string,
    businessNumber: string,
    authData: SimpleAuthData,
  ): Promise<any> {
    try {
      const endApi = '/api/v2.0/HometaxSimpleAuth/UTEABDAA03'
      const endpoint = `${this.tilcoHometaxBaseUrl}${endApi}`

      const requestData: SimpleHometaxBusinessClosureApiReqData = {
        Auth: {
          PrivateAuthType: authData.PrivateAuthType,
          UserName: authData.UserName,
          UserCellphoneNumber: authData.UserCellphoneNumber,
          Token: authData.Token,
          CxId: authData.CxId,
          TxId: authData.TxId,
          ReqTxId: authData.ReqTxId,
          BirthDate: authData.BirthDate,
        },
        BusinessNumber: businessNumber,
        EnglCvaAplnYn: 'N',
        ResnoOpYn: 'Y',
        IssueType: '03',
        Organization: '02',
      }

      const response =
        await this.callTilcoApi<SimpleHometaxBusinessClosureApiReqData>(
          endpoint,
          requestData,
          {
            auth: ['UserName', 'UserCellphoneNumber', 'BirthDate'],
            root: ['BusinessNumber'],
          },
        )

      return response
    } catch (error) {
      throw AppException.from(
        error,
        '폐업증명원원조회 실패',
        'hometax-data', // 현재 프로세스 step
        'business-closure', // 현재 작업 operation
      )
    }
  }

  async getBusinessRegistration(
    userId: string,
    businessNo: string,
    authData: SimpleAuthData,
  ): Promise<any> {
    try {
      const endApi = '/api/v2.0/HometaxSimpleAuth/UTEABGAA21'
      const endpoint = `${this.tilcoHometaxBaseUrl}${endApi}`

      const requestData: SimpleHometaxBusinessCertificateApiReqData = {
        Auth: {
          PrivateAuthType: authData.PrivateAuthType,
          UserName: authData.UserName,
          UserCellphoneNumber: authData.UserCellphoneNumber,
          Token: authData.Token,
          CxId: authData.CxId,
          TxId: authData.TxId,
          ReqTxId: authData.ReqTxId,
          BirthDate: authData.BirthDate,
        },
        BusinessNumber: businessNo,
        EnglCvaAplnYn: 'N',
        ResnoOpYn: 'Y',
        IssueType: '03',
        Organization: '02',
      }

      const response =
        await this.callTilcoApi<SimpleHometaxBusinessCertificateApiReqData>(
          endpoint,
          requestData,
          {
            auth: ['UserName', 'UserCellphoneNumber', 'BirthDate'],
            root: ['BusinessNumber'],
          },
        )
      // this.logger.log({
      //   message: '사업자등록증리턴값',
      //   response: JSON.stringify(response, null, 2),
      // })
      return response
    } catch (error) {
      throw AppException.from(
        error,
        '사업자등록증조회 실패',
        'hometax-data', // 현재 프로세스 step
        'business-register', // 현재 작업 operation
      )
    }
  }

  async getElectronicDeclaration(
    userId: string,
    year: string,
    authData: SimpleAuthData,
  ): Promise<any> {
    try {
      const endApi = '/api/v2.0/HometaxSimpleAuth/UTERNAAZ43'
      const endpoint = `${this.tilcoHometaxBaseUrl}${endApi}`

      const requestData: SimpleHometaxElectronicReportApiReqData = {
        Auth: {
          PrivateAuthType: authData.PrivateAuthType,
          UserName: authData.UserName,
          UserCellphoneNumber: authData.UserCellphoneNumber,
          Token: authData.Token,
          CxId: authData.CxId,
          TxId: authData.TxId,
          ReqTxId: authData.ReqTxId,
          BirthDate: authData.BirthDate,
        },
        BusinessNumber: authData.IdentityNumber,
        TaxItem: '10',
        StartDate: `${year}0101`,
        EndDate: `${year}1231`,
        DocType: 'PDF',
        NtplInfpYn: 'Y',
        IsClaim: 'Y',
      }

      const response =
        await this.callTilcoApi<SimpleHometaxElectronicReportApiReqData>(
          endpoint,
          requestData,
          {
            auth: ['UserName', 'UserCellphoneNumber', 'BirthDate'],
            root: ['BusinessNumber'],
          },
        )

      return response
    } catch (error) {
      throw AppException.from(
        error,
        '전자신고 데이터처리 실패',
        'hometax-data',
        'electronic-declaration',
      )
    }
  }

  async getWorkplaceManagementNumbers(authData: SimpleAuthData): Promise<any> {
    try {
      const endApi = '/api/v2.0/KcomwelSimpleAuth/MyBizInfo'
      const endpoint = `${this.tilcoEmployBaseUrl}${endApi}`

      const requestData: SimpleEmployBusinessManageNoApiReqData = {
        Auth: {
          IdentityNumber: authData.IdentityNumber,
          PrivateAuthType: authData.PrivateAuthType,
          UserName: authData.UserName,
          UserCellphoneNumber: authData.UserCellphoneNumber,
          Token: authData.Token,
          CxId: authData.CxId,
          TxId: authData.TxId,
          ReqTxId: authData.ReqTxId,
        },
        BusinessNumber: authData.IdentityNumber,
        UserGroupFlag: '1',
        IndividualFlag: '1',
      }

      const response =
        await this.callTilcoApi<SimpleEmployBusinessManageNoApiReqData>(
          endpoint,
          requestData,
          {
            auth: ['UserName', 'UserCellphoneNumber', 'IdentityNumber'],
            root: ['BusinessNumber'],
          },
        )

      return response
    } catch (error) {
      throw AppException.from(
        error,
        '사업장관리번호 조회 실패',
        'employ-data', // 현재 프로세스 step
        'my-work-no', // 현재 작업 operation
      )
    }
  }

  async getWorkplaceRate(
    authData: SimpleAuthData,
    gwanriNo: string,
    year: number,
  ): Promise<any> {
    try {
      const endApi = '/api/v2.0/KcomwelSimpleAuth/T100110021005'
      const endpoint = `${this.tilcoEmployBaseUrl}${endApi}`

      const requestData: SimpleEmployBusinessRateApiReqData = {
        Auth: {
          IdentityNumber: authData.IdentityNumber,
          PrivateAuthType: authData.PrivateAuthType,
          UserName: authData.UserName,
          UserCellphoneNumber: authData.UserCellphoneNumber,
          Token: authData.Token,
          CxId: authData.CxId,
          TxId: authData.TxId,
          ReqTxId: authData.ReqTxId,
        },
        // BusinessNumber: authData.IdentityNumber,
        UserGroupFlag: '1',
        IndividualFlag: '1',
        GwanriNo: gwanriNo,
        Year: year.toString(),
      }

      const response =
        await this.callTilcoApi<SimpleEmployBusinessRateApiReqData>(
          endpoint,
          requestData,
          {
            auth: ['UserName', 'UserCellphoneNumber', 'IdentityNumber'],
            // root: ['BusinessNumber'],
          },
        )

      return response
    } catch (error) {
      throw AppException.from(
        error,
        '사업장관리번호 조회 실패',
        'employ-data', // 현재 프로세스 step
        'workplace-rate', // 현재 작업 operation
      )
    }
  }

  async getEmploymentInfo(
    authData: SimpleAuthData,
    gwanriNo: string,
  ): Promise<any> {
    try {
      const endApi = '/api/v2.0/KcomwelSimpleAuth/SelectGeunrojaGyIryeok'
      const endpoint = `${this.tilcoEmployBaseUrl}${endApi}`

      const requestData: SimpleEmployEmploymentInfoApiReqData = {
        Auth: {
          IdentityNumber: authData.IdentityNumber,
          PrivateAuthType: authData.PrivateAuthType,
          UserName: authData.UserName,
          UserCellphoneNumber: authData.UserCellphoneNumber,
          Token: authData.Token,
          CxId: authData.CxId,
          TxId: authData.TxId,
          ReqTxId: authData.ReqTxId,
        },
        BusinessNumber: authData.IdentityNumber,
        UserGroupFlag: '1',
        IndividualFlag: '1',
        GwanriNo: gwanriNo,
        BoheomFg: '2',
        GyStatusCd: '3',
      }

      const response =
        await this.callTilcoApi<SimpleEmployEmploymentInfoApiReqData>(
          endpoint,
          requestData,
          {
            auth: ['UserName', 'UserCellphoneNumber', 'IdentityNumber'],
            root: ['BusinessNumber'],
          },
        )

      return response
    } catch (error) {
      throw AppException.from(
        error,
        '사업장관리번호 조회 실패',
        'employ-data', // 현재 프로세스 step
        'employ-info', // 현재 작업 operation
      )
    }
  }

  async getSalaryDeclaration(
    authData: SimpleAuthData,
    gwanriNo: string,
    year: number,
  ): Promise<any> {
    try {
      const endApi = '/api/v2.0/KcomwelSimpleAuth/SelectBosuJeopsuList'
      const endpoint = `${this.tilcoEmployBaseUrl}${endApi}`

      const requestData: SimpleEmployTotalSalaryApiReqData = {
        Auth: {
          IdentityNumber: authData.IdentityNumber,
          PrivateAuthType: authData.PrivateAuthType,
          UserName: authData.UserName,
          UserCellphoneNumber: authData.UserCellphoneNumber,
          Token: authData.Token,
          CxId: authData.CxId,
          TxId: authData.TxId,
          ReqTxId: authData.ReqTxId,
        },
        BusinessNumber: authData.IdentityNumber,
        UserGroupFlag: '1',
        IndividualFlag: '1',
        BoheomYear: year.toString(),
        GwanriNo: gwanriNo,
      }

      const response =
        await this.callTilcoApi<SimpleEmployTotalSalaryApiReqData>(
          endpoint,
          requestData,
          {
            auth: ['UserName', 'UserCellphoneNumber', 'IdentityNumber'],
            root: ['BusinessNumber'],
          },
        )

      return response
    } catch (error) {
      throw AppException.from(
        error,
        '사업장관리번호 조회 실패',
        'employ-data', // 현재 프로세스 step
        'total-salary', // 현재 작업 operation
      )
    }
  }
}
