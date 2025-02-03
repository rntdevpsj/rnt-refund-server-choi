import {
  ProgressStatus,
  RefundStatus,
} from './../../../common/type/refund-enum.types'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AppException } from 'src/common/exception/app.exception'
import { RefundUserModel } from '../entity/refund-user.entity'

@Injectable()
export class RefundUserService {
  constructor(
    @InjectRepository(RefundUserModel)
    private readonly refundUserRepository: Repository<RefundUserModel>,
  ) {}

  async createRefundRequest(user: Partial<RefundUserModel>) {
    try {
      const authRequest = this.refundUserRepository.create(user)
      console.log('db created')
      return await this.refundUserRepository.save(authRequest)
    } catch (error) {
      throw AppException.database('user테이블 생성 실패', 'system', {
        originalError: error.message,
      })
    }
  }

  async updateRefundRequest(user: Partial<RefundUserModel>): Promise<void> {
    try {
      // if (!user.userId) {
      //   throw new Error('userId 가 없습니다');
      // }

      await this.refundUserRepository.update(
        { userId: user.userId },
        {
          ...user,
          updatedAt: new Date(),
        },
      )
    } catch (error) {
      throw AppException.database('user테이블 수정 실패', 'system', {
        originalError: error.message,
      })
    }
  }

  async updateRefundAmt(
    userId: string,
    refundAmtData: Partial<RefundUserModel>,
  ) {
    try {
      const result = await this.refundUserRepository.update(
        { userId },
        refundAmtData,
      )

      // if (result.affected === 0) {
      //   throw new Error('해당 유저의 데이터를 찾을 수 없습니다.')
      // }

      return result
    } catch (error) {
      throw AppException.database(
        'refund user 환급액 업데이트 실패',
        'system',
        { originalError: error.message },
      )
    }
  }

  async getRefundUser(userId: string) {
    try {
      const refundUser = await this.refundUserRepository.findOne({
        where: { userId },
      })
      return refundUser?.companyType || null
    } catch (error) {
      throw AppException.database('user 테이블 조회 실패', 'system', {
        originalError: error.message,
      })
    }
  }

  async getExistRefundAmount(cashnoteUid: string): Promise<number | null> {
    try {
      const user = await this.refundUserRepository.findOne({
        where: { cashnoteUid },
      })

      if (!user || user.progressStatus !== ProgressStatus.COMPLETED) {
        return null
      }

      return user.estimatedRefundAmt
    } catch (error) {
      throw AppException.database(
        'user 테이블 기존 신청자료 조회 실패',
        'system',
        {
          originalError: error.message,
        },
      )
    }
  }

  // async updateRefundRequest(user: Partial<RefundUserModel>): Promise<void> {
  //   try {
  //     await this.refundUserRepository.update(user.userId, {
  //       ...user,
  //     })
  //   } catch (error) {
  //     throw AppException.database(
  //       'Auth request 상태 업데이트 실패',
  //       'simple-auth-request',
  //       { originalError: error.message },
  //     )
  //   }
  // }

  /******************************
   * 여러 사용자 정보를 일괄 생성
   * @param users - 생성할 사용자 정보 배열
   */
  async createUsers(
    users: Partial<RefundUserModel>[],
  ): Promise<RefundUserModel[]> {
    const userEntities = this.refundUserRepository.create(users)
    return await this.refundUserRepository.save(userEntities)
  }

  /**
   * 여러 사용자 정보를 일괄 업데이트
   * @param users - 업데이트할 사용자 정보 배열 (id 필수)
   */
  async updateUsers(
    users: Partial<RefundUserModel>[],
  ): Promise<RefundUserModel[]> {
    const validUsers = users.filter(user => user.id)

    const updatePromises = validUsers.map(async user => {
      const existingUser = await this.refundUserRepository.findOne({
        where: { id: user.id },
      })

      if (existingUser) {
        // amt 필드의 경우 undefined나 null이면 0으로 설정
        if (
          user.estimatedRefundAmt === undefined ||
          user.estimatedRefundAmt === null
        ) {
          user.estimatedRefundAmt = 0
        }
        if (
          user.estimatedTotalCarriedTaxAmt === undefined ||
          user.estimatedTotalCarriedTaxAmt === null
        ) {
          user.estimatedTotalCarriedTaxAmt = 0
        }

        Object.assign(existingUser, user)
        return await this.refundUserRepository.save(existingUser)
      }
      return null
    })

    const updatedUsers = await Promise.all(updatePromises)
    return updatedUsers.filter(user => user !== null)
  }

  /**
   * 사용자 정보 조회 (userSocialNo로 조회)
   * @param userSocialNo - 조회할 사용자의 주민등록번호
   */
  async findByUserSocialNo(userSocialNo: string): Promise<RefundUserModel> {
    return await this.refundUserRepository.findOne({
      where: { userSocialNo },
    })
  }

  /**
   * 사용자 정보 조회 (userMobileNo로 조회)
   * @param userMobileNo - 조회할 사용자의 휴대폰 번호
   */
  async findByUserMobileNo(userMobileNo: string): Promise<RefundUserModel> {
    return await this.refundUserRepository.findOne({
      where: { userMobileNo },
    })
  }

  /**
   * 단일 사용자 생성
   * @param user - 생성할 사용자 정보
   */
  async createUser(user: Partial<RefundUserModel>): Promise<RefundUserModel> {
    // amt 필드에 대한 기본값 처리
    if (
      user.estimatedRefundAmt === undefined ||
      user.estimatedRefundAmt === null
    ) {
      user.estimatedRefundAmt = 0
    }
    if (
      user.estimatedTotalCarriedTaxAmt === undefined ||
      user.estimatedTotalCarriedTaxAmt === null
    ) {
      user.estimatedTotalCarriedTaxAmt = 0
    }

    const userEntity = this.refundUserRepository.create(user)
    return await this.refundUserRepository.save(userEntity)
  }

  /**
   * 단일 사용자 업데이트
   * @param id - 업데이트할 사용자의 id
   * @param userData - 업데이트할 데이터
   */
  async updateUser(
    id: string,
    userData: Partial<RefundUserModel>,
  ): Promise<RefundUserModel> {
    // amt 필드에 대한 기본값 처리
    if (
      userData.estimatedRefundAmt === undefined ||
      userData.estimatedRefundAmt === null
    ) {
      userData.estimatedRefundAmt = 0
    }
    if (
      userData.estimatedTotalCarriedTaxAmt === undefined ||
      userData.estimatedTotalCarriedTaxAmt === null
    ) {
      userData.estimatedTotalCarriedTaxAmt = 0
    }

    await this.refundUserRepository.update(id, userData)
    return await this.refundUserRepository.findOne({ where: { id } })
  }

  /**
   * 환급 상태별 사용자 조회
   * @param refundStatus - 조회할 환급 상태
   */
  async findByRefundStatus(
    refundStatus: RefundStatus,
  ): Promise<RefundUserModel[]> {
    return await this.refundUserRepository.find({
      where: { refundStatus },
    })
  }

  /**
   * userid로 사용자 존재 여부 확인
   * @param id - 확인할 사용자의 id
   */
  async exists(userId: string): Promise<boolean> {
    const count = await this.refundUserRepository.count({
      where: { userId },
    })
    return count > 0
  }
}

/*
// 사용 예시
const user = {
  appRoute: 'DIRECT',
  userName: '홍길동',
  userMobileNo: '010-1234-5678',
  userSocialNo: '860101-1234567',
  companyType: true,
  refundStatus: 'PENDING',
  // amt 필드를 지정하지 않아도 자동으로 0으로 설정됨
};

// 생성
const createdUser = await refundUserService.createUser(user);

// 조회
const userByMobile = await refundUserService.findByUserMobileNo('010-1234-5678');
const pendingUsers = await refundUserService.findByRefundStatus('PENDING');
*/
