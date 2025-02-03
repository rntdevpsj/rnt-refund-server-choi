import { Injectable, Logger } from '@nestjs/common'
import { promises as fs } from 'fs'
import * as path from 'path'

@Injectable()
export class FileUtilService {
  private readonly logger = new Logger(FileUtilService.name)
  private readonly
  /**
   * API 응답 데이터를 파일로 저장하는 범용 함수
   * @param data - 저장할 데이터 (객체, 배열, 또는 객체 내 배열)
   * @param fileName - 저장할 파일 이름
   * @param options - 추가 옵션 (저장 경로, 인코딩 등)
   */
  async saveResponseToFile(
    data: any,
    fileName: string,
    options: {
      directory?: string
      encoding?: BufferEncoding
      indent?: number
      appendTimestamp?: boolean
      createDirectory?: boolean
    } = {},
  ): Promise<string> {
    try {
      const {
        directory = path.join(
          process.env.HOME || process.env.USERPROFILE,
          'Downloads',
        ),
        encoding = 'utf8',
        indent = 2,
        appendTimestamp = false,
        createDirectory = true,
      } = options

      // 디렉토리가 없으면 생성
      if (createDirectory) {
        await this.ensureDirectoryExists(directory)
      }

      // 타임스탬프 추가 (옵션)
      const timestamp = appendTimestamp ? `_${this.getTimestamp()}` : ''
      const finalFileName = this.addTimestampToFileName(fileName, timestamp)
      const filePath = path.join(directory, finalFileName)

      // 데이터 정규화 및 포맷팅
      const formattedData = this.formatData(data, indent)

      // 파일 쓰기
      await fs.writeFile(filePath, formattedData, { encoding })

      this.logger.log(`파일 저장 완료: ${filePath}`)
      return filePath
    } catch (error) {
      this.logger.error(`파일 저장 중 오류 발생: ${error.message}`)
      throw new Error(`파일 저장 실패: ${error.message}`)
    }
  }

  /**
   * 다양한 형태의 데이터를 일관된 형식으로 포맷팅
   */
  private formatData(data: any, indent: number): string {
    try {
      // null이나 undefined 처리
      if (data == null) {
        return 'null'
      }

      // 데이터가 이미 문자열인 경우
      if (typeof data === 'string') {
        return data
      }

      // 객체나 배열을 JSON 문자열로 변환
      return JSON.stringify(data, this.jsonReplacer, indent)
    } catch (error) {
      this.logger.error(`데이터 포맷팅 중 오류 발생: ${error.message}`)
      throw new Error(`데이터 포맷팅 실패: ${error.message}`)
    }
  }

  /**
   * JSON.stringify용 커스텀 replacer
   * 순환 참조 방지 및 특수 타입 처리
   */
  private jsonReplacer = (key: string, value: any): any => {
    // 화살표 함수로 변경
    // Date 객체 처리
    if (value instanceof Date) {
      return value.toISOString()
    }
    // Set을 배열로 변환
    if (value instanceof Set) {
      return Array.from(value)
    }
    // Map을 객체로 변환
    if (value instanceof Map) {
      return Object.fromEntries(value)
    }
    // BigInt 처리
    if (typeof value === 'bigint') {
      return value.toString()
    }
    // undefined를 문자열로 출력
    if (value === undefined) {
      return 'undefined'
    }
    // null 값 처리
    if (value === null) {
      return 'null'
    }
    // base64로 인코딩된 PDF 데이터 처리
    if (
      typeof value === 'string' &&
      (key.toLowerCase().includes('pdf') || key.toLowerCase().includes('file'))
    ) {
      // base64 패턴 확인
      if (this.isPossiblePdfData(value)) {
        return '[PDF_DATA]'
      }
    }
    return value
  }

  /**
   * 문자열이 base64로 인코딩된 PDF 데이터인지 확인
   */
  private isPossiblePdfData(str: string): boolean {
    // base64 패턴 체크
    const base64Pattern =
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
    // PDF 시그니처 체크 (%PDF-)
    const pdfHeader = Buffer.from('JVBERi0=', 'base64').toString('base64')

    return (
      str.length > 100 && // 일반적인 문자열보다 긴지 확인
      base64Pattern.test(str) && // base64 패턴인지 확인
      (str.startsWith(pdfHeader) || // PDF 헤더로 시작하는지 확인
        str.length > 1000) // 또는 충분히 긴 데이터인지 확인
    )
  }

  /**
   * 디렉토리 존재 확인 및 생성
   */
  private async ensureDirectoryExists(directory: string): Promise<void> {
    try {
      await fs.access(directory)
    } catch {
      await fs.mkdir(directory, { recursive: true })
    }
  }

  /**
   * 현재 타임스탬프 생성
   */
  private getTimestamp(): string {
    return new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .replace('Z', '')
  }

  /**
   * 파일 이름에 타임스탬프 추가
   */
  private addTimestampToFileName(fileName: string, timestamp: string): string {
    const ext = path.extname(fileName)
    const nameWithoutExt = path.basename(fileName, ext)
    return `${nameWithoutExt}${timestamp}${ext}`
  }
}
