import { db } from "@/db";
import { todos } from "@/db/schema";
import TodoApp from "./TodoApp";

export default async function Home() {
  // ดึงข้อมูลจาก Database โดยตรงบน Server (SSR)
  const initialData = await db.select().from(todos).orderBy(todos.createdAt);

  return (
    <main>
      {/* ส่งข้อมูลไปที่ Client Component */}
      <TodoApp initialTodos={initialData} />

      {/* 
          สำหรับ Postman ทดสอบ: 
          เมื่อคุณเรียก GET http://localhost:3000/ ใน Postman 
          คุณจะเห็น HTML ที่มีชื่อ Todo อยู่ในหน้านี้ (Render มาจาก Server)
      */}
      <div style={{ display: 'none' }}>
        {initialData.map(todo => (
          <p key={todo.id}>Todo name: {todo.title}</p>
        ))}
      </div>
    </main>
  );
}
