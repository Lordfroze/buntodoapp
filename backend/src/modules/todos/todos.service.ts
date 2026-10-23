import { eq, and } from "drizzle-orm";
import { db, todos, Todo, NewTodo } from "../../db";
import { v4 as uuidv4 } from "uuid";
import { notFound } from "../../lib/http";

export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  isCompleted?: boolean;
}

export async function getAllByUser(userId: string): Promise<Todo[]> {
  return await db.query.todos.findMany({
    where: eq(todos.userId, userId),
    orderBy: (todos, { desc }) => [desc(todos.createdAt)],
  });
}

export async function findById(id: string, userId: string): Promise<Todo | null> {
  const result = await db.query.todos.findFirst({
    where: and(eq(todos.id, id), eq(todos.userId, userId)),
  });
  return result || null;
}

export async function create(userId: string, input: CreateTodoInput): Promise<Todo> {
  const id = uuidv4();
  const newTodo: NewTodo = {
    id,
    userId,
    title: input.title.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
    isCompleted: false,
  };

  await db.insert(todos).values(newTodo);

  const created = await findById(id, userId);
  if (!created) {
    throw new Error("Failed to create todo");
  }
  return created;
}

export async function update(
  id: string,
  userId: string,
  input: UpdateTodoInput
): Promise<Todo> {
  const existing = await findById(id, userId);
  if (!existing) {
    throw notFound("Todo not found");
  }

  const updateData: Partial<NewTodo> = {};
  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.description !== undefined) {
    updateData.description = input.description?.trim() ? input.description.trim() : null;
  }
  if (input.isCompleted !== undefined) updateData.isCompleted = input.isCompleted;

  if (Object.keys(updateData).length > 0) {
    await db
      .update(todos)
      .set(updateData)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)));
  }

  const updated = await findById(id, userId);
  return updated ?? { ...existing, ...updateData } as Todo;
}

export async function remove(id: string, userId: string): Promise<void> {
  const existing = await findById(id, userId);
  if (!existing) {
    throw notFound("Todo not found");
  }
  await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)));
}
