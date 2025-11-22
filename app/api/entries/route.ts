import { NextRequest, NextResponse } from 'next/server';
import { getEntries, addEntry, updateEntry, deleteEntry } from '@/lib/db';

// Middleware to check authentication
function isAuthenticated(request: NextRequest): boolean {
    const session = request.cookies.get('session');
    return session?.value === 'authenticated';
}

// GET - Fetch all entries
export async function GET(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const entries = await getEntries();
        return NextResponse.json({ entries }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch entries' },
            { status: 500 }
        );
    }
}

// POST - Add new entry
export async function POST(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const data = await request.json();

        // Validate required fields
        const requiredFields = ['gmail', 'password', 'startDate', 'endDate', 'accountNo', 'mobileNumber'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return NextResponse.json(
                    { error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // Validate accountNo
        if (data.accountNo !== '1' && data.accountNo !== '2') {
            return NextResponse.json(
                { error: 'Account number must be 1 or 2' },
                { status: 400 }
            );
        }

        const newEntry = await addEntry(data);
        return NextResponse.json({ entry: newEntry }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create entry' },
            { status: 500 }
        );
    }
}

// PATCH - Update entry
export async function PATCH(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const { id, ...updates } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Entry ID is required' },
                { status: 400 }
            );
        }

        const updatedEntry = await updateEntry(id, updates);

        if (!updatedEntry) {
            return NextResponse.json(
                { error: 'Entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ entry: updatedEntry }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update entry' },
            { status: 500 }
        );
    }
}

// DELETE - Delete entry
export async function DELETE(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Entry ID is required' },
                { status: 400 }
            );
        }

        const deleted = await deleteEntry(id);

        if (!deleted) {
            return NextResponse.json(
                { error: 'Entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete entry' },
            { status: 500 }
        );
    }
}
