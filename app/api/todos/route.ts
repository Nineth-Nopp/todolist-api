import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET    /api/todos          → list all
// GET    /api/todos?id=5     → get one (optional query)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
        const result = await db
            .select()
            .from(todos)
            .where(eq(todos.id, Number(id)))
            .limit(1);

        return NextResponse.json(result[0] || null);
    }

    const allTodos = await db.select().from(todos).orderBy(todos.createdAt);
    return NextResponse.json(allTodos);
}

// POST   /api/todos          → create
export async function POST(request: Request) {
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const newTodo = await db
        .insert(todos)
        .values({
            title,
            description: description || null,
        })
        .returning();

    return NextResponse.json(newTodo[0], { status: 201 });
}

// PUT    /api/todos?id=5     → update
export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, completed } = body;

    const updated = await db
        .update(todos)
        .set({
            title,
            description,
            completed: completed ?? undefined,
        })
        .where(eq(todos.id, Number(id)))
        .returning();

    if (updated.length === 0) {
        return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
}

// DELETE /api/todos?id=5     → delete
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deleted = await db
        .delete(todos)
        .where(eq(todos.id, Number(id)))
        .returning();

    if (deleted.length === 0) {
        return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}