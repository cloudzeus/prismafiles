import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { service, username, password, appId, COMPANY, BRANCH, MODULE, REFID } = body
    
    if (!service || !username || !password || !appId || !COMPANY || !BRANCH || !MODULE || !REFID) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: service, username, password, appId, COMPANY, BRANCH, MODULE, REFID' },
        { status: 400 }
      )
    }

    // Log the request payload for debugging
    const requestPayload = {
      service,
      username,
      password,
      appId,
      COMPANY,
      BRANCH,
      MODULE,
      REFID,
    }
    console.log('🔐 ERP Authentication request:', JSON.stringify(requestPayload, null, 2))

    // Make request to ERP system
    const erpResponse = await fetch('https://kolleris.oncloud.gr/s1services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    })

    console.log('📡 ERP Response status:', erpResponse.status)
    console.log('📡 ERP Response headers:', Object.fromEntries(erpResponse.headers.entries()))

    const responseText = await erpResponse.text()
    console.log('📡 ERP Response body:', responseText)

    if (!erpResponse.ok) {
      throw new Error(`ERP request failed: ${erpResponse.status} - ${responseText}`)
    }

    let erpData
    try {
      erpData = JSON.parse(responseText)
    } catch (parseError) {
      throw new Error(`Invalid JSON response from ERP: ${responseText}`)
    }
    
    console.log('📊 ERP Data:', JSON.stringify(erpData, null, 2))
    
    if (!erpData.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ERP authentication failed',
          details: erpData
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      clientID: erpData.clientID,
      s1u: erpData.s1u,
      hyperlinks: erpData.hyperlinks,
      canexport: erpData.canexport,
      image: erpData.image,
      companyinfo: erpData.companyinfo
    })

  } catch (error) {
    console.error('ERP Authentication error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
