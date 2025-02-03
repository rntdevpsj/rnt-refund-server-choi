import * as fs from 'fs'
import * as path from 'path'
import { Logger } from '@nestjs/common'

interface StructureInfo {
  type: string
  size?: number
  properties?: Record<string, StructureInfo>
  items?: StructureInfo // for arrays
}

export function analyzeApiStructure(apiResponse: any, fileType: string): void {
  const logger = new Logger('ApiStructureAnalyzer')

  function getStructureInfo(data: any): StructureInfo {
    if (data === null) return { type: 'null' }
    if (Array.isArray(data)) {
      return {
        type: 'array',
        items:
          data.length > 0 ? getStructureInfo(data[0]) : { type: 'unknown' },
      }
    }

    const type = typeof data
    if (type !== 'object') {
      if (type === 'string' && data.length > 1000) {
        return {
          type: 'string (base64)',
          size: Buffer.from(data, 'base64').length,
        }
      }
      return { type }
    }

    const properties: Record<string, StructureInfo> = {}
    for (const [key, value] of Object.entries(data)) {
      properties[key] = getStructureInfo(value)
    }
    return { type: 'object', properties }
  }

  // 전체 구조 분석
  const structure = getStructureInfo(apiResponse)

  // 결과를 보기 좋게 포맷팅
  function formatStructure(info: StructureInfo, indent = ''): string {
    if (info.type === 'array') {
      return `Array of:\n${indent}  ${formatStructure(info.items!, indent + '  ')}`
    }
    if (info.size !== undefined) {
      return `${info.type} (size: ${(info.size / 1024).toFixed(2)} KB)`
    }
    if (info.properties) {
      const props = Object.entries(info.properties)
        .map(
          ([key, value]) =>
            `${indent}  ${key}: ${formatStructure(value, indent + '  ')}`,
        )
        .join('\n')
      return `{\n${props}\n${indent}}`
    }
    return info.type
  }

  // 결과를 파일로 저장
  const downloadFolder = path.join(
    process.env.HOME || process.env.USERPROFILE || '',
    'Downloads',
  )
  const filename = path.join(downloadFolder, `${fileType}.txt`)

  const content = formatStructure(structure)
  fs.writeFileSync(filename, content, 'utf8')

  logger.log(`API 구조가 ${filename}에 저장되었습니다.`)
  logger.debug('Structure overview:', {
    totalKeys: Object.keys(apiResponse || {}).length,
    hasResult: !!apiResponse?.Result,
    resultType: Array.isArray(apiResponse?.Result)
      ? 'array'
      : typeof apiResponse?.Result,
  })
}

// 사용 예시:
// analyzeApiStructure(apiResponse);
