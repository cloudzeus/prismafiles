import { NextRequest, NextResponse } from 'next/server'
import iconv from 'iconv-lite'

export async function POST(request: NextRequest) {
  try {
    const { appId, clientId, SqlName, service, param1, param2 } = await request.json()
    
    console.log('🚀 Fetching companies from ERP...')
    console.log('   AppID:', appId)
    console.log('   ClientID:', clientId)
    console.log('   SqlName:', SqlName)
    console.log('   Service:', service)
    console.log('   Param1:', param1)
    console.log('   Param2:', param2)
    
    const payload = {
      appId,
      clientId,
      SqlName,
      service,
      param1,
      param2
    }
    
    console.log('📤 Sending payload to ERP:', JSON.stringify(payload, null, 2))
    
    // Use fetch to get raw response data
    const response = await fetch('https://kolleris.oncloud.gr/s1services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error(`ERP request failed: ${response.status} ${response.statusText}`)
    }
    
    console.log('📥 ERP Response Status:', response.status)
    console.log('📥 ERP Response Headers:', Object.fromEntries(response.headers.entries()))
    
    // Get the raw response as array buffer to preserve encoding
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Log raw buffer info
    console.log('🔍 Raw Buffer Info:')
    console.log('   Buffer length:', buffer.length)
    console.log('   First 100 bytes (hex):', buffer.toString('hex').substring(0, 200))
    console.log('   First 100 bytes (ascii):', buffer.toString('ascii', 0, 100))
    
    // The response is encoded in ANSI 1253 (Windows Greek), so we need to convert it TO UTF-8
    let jsonText
    console.log('🔄 Converting FROM ANSI 1253 TO UTF-8...')
    
    try {
      // The key insight: we need to decode FROM win1253 TO UTF-8
      // This means the buffer contains win1253 encoded bytes that we want to convert to UTF-8
      jsonText = iconv.decode(buffer, 'win1253')
      
      // Test if conversion worked by parsing JSON
      const testData = JSON.parse(jsonText)
      console.log('✅ Successfully decoded FROM ANSI 1253 TO UTF-8')
      
      // Log a sample company name to verify encoding is correct
      if (testData.rows && testData.rows.length > 0) {
        const sampleCompany = testData.rows[0]
        console.log('🔍 Sample company after conversion:')
        console.log('   Name:', sampleCompany.name)
        console.log('   Name length:', sampleCompany.name?.length || 0)
        console.log('   Code:', sampleCompany.code)
        console.log('   AFM:', sampleCompany.afm)
        
        // Check if the name contains Greek characters
        const hasGreekChars = /[α-ωΑ-Ω]/.test(sampleCompany.name)
        console.log('   Contains Greek characters:', hasGreekChars)
      }
      
    } catch (conversionError) {
      console.log('❌ ANSI 1253 to UTF-8 conversion failed, trying other encodings...')
      
      // Try other common Greek encodings
      const encodings = ['iso-8859-7', 'cp1253', 'latin1']
      for (const encoding of encodings) {
        try {
          jsonText = iconv.decode(buffer, encoding)
          const testData = JSON.parse(jsonText)
          console.log(`✅ Successfully decoded FROM ${encoding} TO UTF-8`)
          
          // Log sample data for this encoding
          if (testData.rows && testData.rows.length > 0) {
            const sampleCompany = testData.rows[0]
            console.log(`🔍 Sample company using ${encoding}:`)
            console.log('   Name:', sampleCompany.name)
            console.log('   Name length:', sampleCompany.name?.length || 0)
            
            // Check if the name contains Greek characters
            const hasGreekChars = /[α-ωΑ-Ω]/.test(sampleCompany.name)
            console.log('   Contains Greek characters:', hasGreekChars)
          }
          break
        } catch (e) {
          console.log(`❌ ${encoding} to UTF-8 failed`)
        }
      }
      
      // If all fail, throw error
      if (!jsonText) {
        throw new Error('Failed to decode response FROM ANSI 1253 TO UTF-8')
      }
    }
    
    // Parse the JSON
    const data = JSON.parse(jsonText)
    
    if (!data.success) {
      throw new Error(`ERP returned error: ${data.error || 'Unknown error'}`)
    }
    
    console.log('📊 ERP Response Data:')
    console.log('   Success:', data.success)
    console.log('   Total Count:', data.totalcount)
    console.log('   Rows Count:', data.rows?.length || 0)
    
    // Log sample company data for debugging
    if (data.rows && data.rows.length > 0) {
      const sampleCompany = data.rows[0]
      console.log('📋 Sample Company Data:')
      console.log('   Name:', sampleCompany.name)
      console.log('   Name length:', sampleCompany.name?.length || 0)
      console.log('   Code:', sampleCompany.code)
      console.log('   AFM:', sampleCompany.afm)
    }
    
    return NextResponse.json({
      success: true,
      data: data
    })
    
  } catch (error) {
    console.error('❌ Error fetching companies from ERP:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch companies' 
      },
      { status: 500 }
    )
  }
}
