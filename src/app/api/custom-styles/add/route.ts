import { NextRequest, NextResponse } from 'next/server';
import { customStyleManager } from '@/lib/custom-styles';

export async function POST(request: NextRequest) {
  try {
    const {
      trainingResult,
      styleName,
      triggerWord,
      description,
      tags
    } = await request.json();

    // Validate required fields
    if (!trainingResult || !styleName || !triggerWord) {
      return NextResponse.json(
        { error: 'Missing required fields: trainingResult, styleName, and triggerWord are required' },
        { status: 400 }
      );
    }

    // Validate training result structure
    if (!trainingResult.data?.diffusers_lora_file?.url || !trainingResult.data?.config_file?.url) {
      return NextResponse.json(
        { error: 'Invalid training result: missing LoRA file or config file URLs' },
        { status: 400 }
      );
    }

    // Add the trained style
    const customStyle = await customStyleManager.addTrainedStyle(
      trainingResult,
      styleName,
      triggerWord,
      description,
      tags
    );

    console.log('🎨 [Custom Styles API] Added new trained style:', customStyle);

    return NextResponse.json({
      success: true,
      style: customStyle,
      message: 'Custom style added successfully'
    });

  } catch (error) {
    console.error('❌ [Custom Styles API] Error adding custom style:', error);
    return NextResponse.json(
      { error: 'Failed to add custom style' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const availableStyles = customStyleManager.getAvailableStyles();
    const stats = customStyleManager.getUsageStats();

    return NextResponse.json({
      success: true,
      styles: availableStyles,
      stats
    });

  } catch (error) {
    console.error('❌ [Custom Styles API] Error fetching custom styles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom styles' },
      { status: 500 }
    );
  }
}
