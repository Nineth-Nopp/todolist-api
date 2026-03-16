// app/todo/[id]/page.tsx
import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"


export default async function TodoDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const todoId = parseInt(id);

    // ดึงข้อมูล Todo ตาม ID จาก Database
    const result = await db
        .select()
        .from(todos)
        .where(eq(todos.id, todoId))
        .limit(1);

    const todo = result[0];

    if (!todo) return notFound(); // ถ้าไม่เจอ ID นี้ ให้แสดงหน้า 404

    return (
        <div className="detail-container">
            <div className="glass-card detail-card">
                <Link href="/" className="back-link">← กลับไปหน้าแรก</Link>

                {/* make data table */}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Completed</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">{todo.id}</TableCell>
                            <TableCell className="font-medium">{todo.title}</TableCell>
                            <TableCell className="font-medium">{todo.description}</TableCell>
                            <TableCell className="font-medium">{todo.completed ? "Yes" : "No"}</TableCell>
                            <TableCell className="font-medium">{todo.createdAt.toLocaleString("th-TH")}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>


            </div>
        </div>
    );
}
