/**
 * Tool Registration API
 * 
 * Registers new tools in the system
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase/server-init';
import { ToolConfiguration } from '@/lib/models/tool-config';

const db = getFirestore(adminApp);

export async function POST(request: NextRequest) {
  try {
    const toolData: Partial<ToolConfiguration> = await request.json();

    // Validation
    if (!toolData.name) {
      return NextResponse.json(
        { error: 'Tool name is required' },
        { status: 400 }
      );
    }

    if (!toolData.description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!toolData.type) {
      toolData.type = 'custom';
    }

    // Check if tool already exists
    const existingTool = await db
      .collection('tools')
      .where('name', '==', toolData.name)
      .get();

    if (!existingTool.empty) {
      return NextResponse.json(
        { error: 'Tool with this name already exists' },
        { status: 409 }
      );
    }

    // Create tool configuration
    const tool: ToolConfiguration = {
      name: toolData.name,
      description: toolData.description,
      type: toolData.type,
      inputSchema: toolData.inputSchema || {
        type: 'object',
        properties: {},
      },
      outputSchema: toolData.outputSchema || {
        type: 'object',
        properties: {},
      },
      handler: toolData.handler || '',
      timeout: toolData.timeout || 30000,
      version: toolData.version || '1.0.0',
      tags: toolData.tags || [],
      config: toolData.config,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    // Save to Firestore
    const docRef = await db.collection('tools').add({
      ...tool,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      tool: {
        ...tool,
        id: docRef.id,
      },
    });
  } catch (error: any) {
    console.error('Tool registration error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to register tool',
      },
      { status: 500 }
    );
  }
}
