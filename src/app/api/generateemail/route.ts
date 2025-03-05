import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/prisma/db";

import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }
    // Parse request body
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPEN_ROUTER_API_KEY,
    });
    const body = await request.json();
    const workspaceId = body.workspaceId;

    const now = new Date();

    // Adjust to get Monday as the start of the week
    // The following code will get the start of the week (Monday) and the end of the week (Sunday)
    // And then fetch all tasks that were completed in the current week
    const dayOfWeek = now.getDay() || 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const workspace = await db.workspace.findFirst({
      where: { id: workspaceId, userId: session.user.id },
      include: {
        tasks: {
          where: {
            doneAt: {
              gte: startOfWeek,
              lt: endOfWeek,
            },
          },
          select: {
            title: true,
            description: true,
          },
        },
      },
    });

    if (!workspace)
      return NextResponse.json(
        {
          success: false,
          message: "Workspace not found",
        },
        {
          status: 404,
        }
      );

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    const prompt = `
        Generate a professional email summarizing the following completed tasks in the triple quote marks :
        '''
        ${workspace.tasks
          .map((task) => {
            return `Task: ${task.title}
            Description: ${task.description}`;
          })
          .join("\n")}
        '''
        Follow the following rules for the email:
        1. Address the email receiver's name to the following name: ${
          workspace.receiverName
        }
        2. Do not use placeholder text in the email like [Receiver Name] or [Your Name] that will make them detect it as a generated email.
        3. Keep the email in a human-like tone. 
        4. Improve the task descriptions if needed.
        5. Make sure the email is concise and to the point.
        6. Make sure the email is well-formatted.
        7. Include the sender's name at the end of the email, which is:  ${
          user?.firstname
        } ${user?.lastname}.
        
    `;

    // Call OpenAI API to generate the email
    const response = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [{ role: "user", content: prompt }],
    });

    // Extract the email text from the proper field without JSON.stringify
    const emailText = response.choices[0].message.content;

    if (!emailText) {
      return NextResponse.json({
        success: false,
        message: "Error generating email",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully created the email.",
      email: emailText,
    });
  } catch (error) {
    console.error("Error generating email:", error);
    return NextResponse.json({
      success: false,
      message: "Error generating email",
    });
  }
}
