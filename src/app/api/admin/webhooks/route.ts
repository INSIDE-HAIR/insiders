/**
 * Webhook Administration API Endpoint
 * GET/POST/PUT/DELETE /api/admin/webhooks
 */

import { NextRequest, NextResponse } from "next/server";
import {
  WebhookRoutingService,
  RoutingRule,
} from "@/features/video-conferencing/services/WebhookRoutingService";
import { WebhookValidationService } from "@/features/video-conferencing/services/WebhookValidationService";
import { z } from "zod";

// Initialize services
const routingService = new WebhookRoutingService();
const validationService = new WebhookValidationService();

// Validation schemas
const routingRuleSchema = z.object({
  id: z.string().min(1),
  provider: z.enum(["ZOOM", "MEET", "VIMEO"]).optional(),
  eventType: z.string().min(1),
  handlerName: z.string().min(1),
  enabled: z.boolean(),
  priority: z.number().int().min(0).max(1000),
  conditions: z
    .object({
      meetingIdPattern: z.string().optional(),
      userIdPattern: z.string().optional(),
      payloadConditions: z.record(z.any()).optional(),
    })
    .optional(),
});

const webhookConfigSchema = z.object({
  zoom: z
    .object({
      secretToken: z.string().optional(),
      verificationToken: z.string().optional(),
    })
    .optional(),
  meet: z
    .object({
      secretKey: z.string().optional(),
      projectId: z.string().optional(),
    })
    .optional(),
  vimeo: z
    .object({
      secretKey: z.string().optional(),
      clientId: z.string().optional(),
    })
    .optional(),
});

// GET - Get webhook configuration and status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    switch (section) {
      case "rules":
        return NextResponse.json({
          success: true,
          data: {
            rules: routingService.getRoutingRules(),
            totalRules: routingService.getRoutingRules().length,
          },
        });

      case "handlers":
        return NextResponse.json({
          success: true,
          data: {
            handlers: routingService.getHandlerStats(),
            totalHandlers: Object.keys(routingService.getHandlerStats()).length,
          },
        });

      case "status":
        return NextResponse.json({
          success: true,
          data: {
            queue: routingService.getQueueStatus(),
            supportedProviders: validationService.getSupportedProviders(),
            configuration: validationService.validateConfiguration(),
          },
        });

      case "config":
        // Return configuration status (without sensitive data)
        const configValidation = validationService.validateConfiguration();
        return NextResponse.json({
          success: true,
          data: {
            isValid: configValidation.isValid,
            errors: configValidation.errors,
            supportedProviders: validationService.getSupportedProviders(),
          },
        });

      default:
        // Return complete webhook admin overview
        return NextResponse.json({
          success: true,
          data: {
            rules: routingService.getRoutingRules(),
            handlers: routingService.getHandlerStats(),
            queue: routingService.getQueueStatus(),
            configuration: validationService.validateConfiguration(),
            supportedProviders: validationService.getSupportedProviders(),
          },
        });
    }
  } catch (error) {
    console.error("Webhook admin GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get webhook information",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Create new routing rule or update configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "rule":
        // Create new routing rule
        const ruleValidation = routingRuleSchema.safeParse(body);
        if (!ruleValidation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid routing rule data",
              details: ruleValidation.error.errors,
            },
            { status: 400 }
          );
        }

        const newRule: RoutingRule = ruleValidation.data;

        // Check if rule ID already exists
        const existingRules = routingService.getRoutingRules();
        if (existingRules.some((rule) => rule.id === newRule.id)) {
          return NextResponse.json(
            {
              success: false,
              error: "Routing rule with this ID already exists",
            },
            { status: 409 }
          );
        }

        routingService.addRoutingRule(newRule);

        return NextResponse.json({
          success: true,
          message: "Routing rule created successfully",
          data: newRule,
        });

      case "config":
        // Update webhook configuration
        const configValidation = webhookConfigSchema.safeParse(body);
        if (!configValidation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid configuration data",
              details: configValidation.error.errors,
            },
            { status: 400 }
          );
        }

        validationService.updateConfiguration(configValidation.data);

        return NextResponse.json({
          success: true,
          message: "Configuration updated successfully",
        });

      case "test":
        // Test webhook configuration
        const testResult = await testWebhookConfiguration(body);
        return NextResponse.json({
          success: true,
          data: testResult,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Use ?action=rule, ?action=config, or ?action=test",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Webhook admin POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing routing rule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get("ruleId");

    if (!ruleId) {
      return NextResponse.json(
        {
          success: false,
          error: "Rule ID is required",
        },
        { status: 400 }
      );
    }

    // Validate rule data
    const ruleValidation = routingRuleSchema.safeParse(body);
    if (!ruleValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid routing rule data",
          details: ruleValidation.error.errors,
        },
        { status: 400 }
      );
    }

    const updatedRule: RoutingRule = ruleValidation.data;

    // Check if rule exists
    const existingRules = routingService.getRoutingRules();
    const ruleExists = existingRules.some((rule) => rule.id === ruleId);

    if (!ruleExists) {
      return NextResponse.json(
        {
          success: false,
          error: "Routing rule not found",
        },
        { status: 404 }
      );
    }

    // Remove old rule and add updated one
    routingService.removeRoutingRule(ruleId);
    routingService.addRoutingRule(updatedRule);

    return NextResponse.json({
      success: true,
      message: "Routing rule updated successfully",
      data: updatedRule,
    });
  } catch (error) {
    console.error("Webhook admin PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update routing rule",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete routing rule or clear queue
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get("ruleId");
    const action = searchParams.get("action");

    if (action === "clearQueue") {
      routingService.clearQueue();
      return NextResponse.json({
        success: true,
        message: "Event queue cleared successfully",
      });
    }

    if (!ruleId) {
      return NextResponse.json(
        {
          success: false,
          error: "Rule ID is required",
        },
        { status: 400 }
      );
    }

    const removed = routingService.removeRoutingRule(ruleId);

    if (!removed) {
      return NextResponse.json(
        {
          success: false,
          error: "Routing rule not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Routing rule deleted successfully",
    });
  } catch (error) {
    console.error("Webhook admin DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete routing rule",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Test webhook configuration
async function testWebhookConfiguration(testData: any): Promise<any> {
  const { provider, payload, headers } = testData;

  if (!provider || !payload) {
    throw new Error("Provider and payload are required for testing");
  }

  try {
    // Test webhook validation
    const validationResult = await validationService.validateWebhook(
      JSON.stringify(payload),
      headers || {},
      Buffer.from(JSON.stringify(payload))
    );

    // Extract event info
    const eventInfo = validationService.extractEventInfo(
      JSON.stringify(payload),
      provider
    );

    return {
      validation: validationResult,
      eventInfo,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      validation: {
        isValid: false,
        provider: null,
        error: error instanceof Error ? error.message : "Test failed",
      },
      eventInfo: null,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
