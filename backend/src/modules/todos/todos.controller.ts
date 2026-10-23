import Elysia from "elysia";
import { z } from "zod";
import * as todosService from "./todos.service";
import { getUserFromRequest } from "../../middleware/auth";
import { unauthorized, notFound } from "../../lib/http";

const createSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
});

const updateSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(255, "Title is too long").optional(),
    description: z.string().max(1000, "Description is too long").optional(),
    isCompleted: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.description !== undefined ||
      value.isCompleted !== undefined,
    { message: "At least one field must be provided" }
  );

export const todosController = new Elysia({ prefix: "/api/todos" })
  .get(
    "/",
    async ({ request }) => {
      const user = await getUserFromRequest(request);
      if (!user) throw unauthorized();

      const data = await todosService.getAllByUser(user.id);
      return { success: true, data };
    },
    { detail: { description: "Get all todos for the current user" } }
  )
  .post(
    "/",
    async ({ request, body, set }) => {
      const user = await getUserFromRequest(request);
      if (!user) throw unauthorized();

      const input = createSchema.parse(body);
      const todo = await todosService.create(user.id, input);
      set.status = 201;
      return { success: true, data: todo };
    },
    { detail: { description: "Create a new todo" } }
  )
  .get(
    "/:id",
    async ({ request, params }) => {
      const user = await getUserFromRequest(request);
      if (!user) throw unauthorized();

      const todo = await todosService.findById(params.id, user.id);
      if (!todo) throw notFound("Todo not found");

      return { success: true, data: todo };
    },
    { detail: { description: "Get a single todo by ID" } }
  )
  .patch(
    "/:id",
    async ({ request, params, body }) => {
      const user = await getUserFromRequest(request);
      if (!user) throw unauthorized();

      const input = updateSchema.parse(body);
      const todo = await todosService.update(params.id, user.id, input);
      if (!todo) throw notFound("Todo not found");

      return { success: true, data: todo };
    },
    { detail: { description: "Update a todo" } }
  )
  .delete(
    "/:id",
    async ({ request, params }) => {
      const user = await getUserFromRequest(request);
      if (!user) throw unauthorized();

      await todosService.remove(params.id, user.id);
      return { success: true, message: "Todo deleted successfully" };
    },
    { detail: { description: "Delete a todo" } }
  );
