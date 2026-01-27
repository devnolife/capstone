import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

interface ValidationResult {
  valid: boolean;
  url: string;
  status?: number;
  statusText?: string;
  responseTime?: number;
  error?: string;
  title?: string;
  redirectUrl?: string;
}

/**
 * API endpoint to validate if a URL is accessible
 * POST /api/validate-url
 * Body: { url: string }
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json(
          { 
            valid: false, 
            url, 
            error: 'URL harus menggunakan protokol http atau https' 
          },
          { status: 200 }
        );
      }
    } catch {
      return NextResponse.json(
        { 
          valid: false, 
          url, 
          error: 'Format URL tidak valid' 
        },
        { status: 200 }
      );
    }

    // Try to fetch the URL
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, {
        method: 'HEAD', // Use HEAD to minimize data transfer
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Capstone-URL-Validator/1.0',
        },
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      // If HEAD fails, try GET (some servers don't support HEAD)
      if (!response.ok && response.status === 405) {
        const getResponse = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(10000),
          redirect: 'follow',
          headers: {
            'User-Agent': 'Capstone-URL-Validator/1.0',
          },
        });

        const result: ValidationResult = {
          valid: getResponse.ok,
          url,
          status: getResponse.status,
          statusText: getResponse.statusText,
          responseTime: Date.now() - startTime,
          redirectUrl: getResponse.url !== url ? getResponse.url : undefined,
        };

        // Try to get page title from HTML
        if (getResponse.ok) {
          try {
            const html = await getResponse.text();
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch) {
              result.title = titleMatch[1].trim().substring(0, 100);
            }
          } catch {
            // Ignore title extraction errors
          }
        }

        return NextResponse.json(result);
      }

      const result: ValidationResult = {
        valid: response.ok,
        url,
        status: response.status,
        statusText: response.statusText,
        responseTime,
        redirectUrl: response.url !== url ? response.url : undefined,
      };

      // For successful HEAD requests, also try to get page title via GET
      if (response.ok) {
        try {
          const getResponse = await fetch(url, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
            redirect: 'follow',
            headers: {
              'User-Agent': 'Capstone-URL-Validator/1.0',
            },
          });
          
          if (getResponse.ok) {
            const html = await getResponse.text();
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch) {
              result.title = titleMatch[1].trim().substring(0, 100);
            }
          }
        } catch {
          // Ignore title extraction errors
        }
      }

      return NextResponse.json(result);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      let errorMessage = 'Gagal menghubungi URL';
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Timeout - URL tidak merespons dalam 10 detik';
        } else if (fetchError.message.includes('ENOTFOUND')) {
          errorMessage = 'Domain tidak ditemukan';
        } else if (fetchError.message.includes('ECONNREFUSED')) {
          errorMessage = 'Koneksi ditolak oleh server';
        } else if (fetchError.message.includes('certificate')) {
          errorMessage = 'Masalah sertifikat SSL';
        } else {
          errorMessage = fetchError.message;
        }
      }

      return NextResponse.json({
        valid: false,
        url,
        error: errorMessage,
        responseTime,
      });
    }
  } catch (error) {
    console.error('Error validating URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
