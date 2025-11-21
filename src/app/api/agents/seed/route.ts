import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST() {
  try {
    const scriptPath = path.join(process.cwd(), 'src/lib/db/safe-setup-agent-database.js');
    
    console.log('Starting database seeding...');
    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`);
    
    if (stderr) {
      console.warn('Seeding warnings:', stderr);
    }
    
    console.log('Seeding output:', stdout);
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      output: stdout
    }, {
      status: 200,
    });
    
  } catch (error) {
    console.error('Database seeding failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to seed database',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
    });
  }
}