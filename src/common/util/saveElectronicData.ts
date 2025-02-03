import * as fs from 'fs'
import * as path from 'path'
import { Logger } from '@nestjs/common'

export function saveElectronicData(apiResponse: any, fileName: string): void {
  const logger = new Logger('ApiResponseSaver')

  try {
    // 응답 데이터 포맷팅
    function formatValue(value: any): string {
      if (value === null) return 'null'
      if (value === undefined) return 'undefined'
      if (Array.isArray(value)) {
        if (value.length === 0) return 'Empty Array'
        return `Array of ${value.length} items`
      }
      return String(value)
    }

    // 출력 내용 생성
    let content = '=== API Response Data ===\n\n'

    // 배열이 아닌 top-level 필드들 먼저 처리
    const topLevelFields = [
      'ApiTxKey',
      'Status',
      'StatusSeq',
      'ErrorCode',
      'Message',
      'ErrorLog',
      'TargetCode',
      'TargetMessage',
      'PointBalance',
    ]

    topLevelFields.forEach(field => {
      if (field in apiResponse) {
        content += `${field}: ${formatValue(apiResponse[field])}\n`
      }
    })

    // 배열 필드들 처리
    content += '\n=== Array Fields ===\n'
    ;['PdfList', 'PdfName', 'PdfLength', 'Result'].forEach(field => {
      if (Array.isArray(apiResponse[field])) {
        content += `\n${field}: Array with ${apiResponse[field].length} items\n`
        apiResponse[field].forEach((item: any, index: number) => {
          content += `  [${index}]: ${formatValue(item)}\n`
        })
      }
    })

    // 다운로드 폴더에 저장
    const downloadFolder = path.join(
      process.env.HOME || process.env.USERPROFILE || '',
      'Downloads',
    )
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fullFileName = path.join(
      downloadFolder,
      `${fileName}_${timestamp}.txt`,
    )

    fs.writeFileSync(fullFileName, content, 'utf8')

    logger.log(`API 응답이 파일에 저장되었습니다: ${fullFileName}`)
  } catch (error) {
    logger.error('파일 저장 중 오류 발생:', error)
    throw error
  }
}
