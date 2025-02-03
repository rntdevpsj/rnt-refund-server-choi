import * as fs from 'fs'
import * as path from 'path'
import { Logger } from '@nestjs/common'

export function saveApiResponseData(apiResponse: any, type: string): void {
  const logger = new Logger('ApiDataSaver')

  function formatValue(value: any): string {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  function processData(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => {
        // PdfData를 제외한 모든 필드를 포함
        const { PdfData, ...rest } = item
        return Object.entries(rest).map(([key, value]) => ({
          field: key,
          value: formatValue(value),
        }))
      })
    }
    return []
  }

  // 결과를 보기 좋게 포맷팅
  function formatOutput(processedData: any[]): string {
    let output = '=== API Response Data ===\n\n'

    processedData.forEach((item, index) => {
      output += `[Item ${index + 1}]\n`
      item.forEach((field: { field: string; value: string }) => {
        output += `${field.field}: ${field.value}\n`
      })
      output += '\n'
    })

    return output
  }

  try {
    // 데이터 처리
    const processedData = processData(apiResponse.Result)
    const output = formatOutput(processedData)

    // 다운로드 폴더에 저장
    const downloadFolder = path.join(
      process.env.HOME || process.env.USERPROFILE || '',
      'Downloads',
    )
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = path.join(downloadFolder, `api-response-data-${type}.txt`)

    fs.writeFileSync(filename, output, 'utf8')

    logger.log(`API 데이터가 ${filename}에 저장되었습니다.`)
    logger.debug('저장된 데이터 개요:', {
      totalItems: processedData.length,
      savedAt: timestamp,
    })
  } catch (error) {
    logger.error('데이터 저장 중 오류 발생:', error)
    throw error
  }
}

// 사용 예시:
// saveApiResponseData(apiResponse);
