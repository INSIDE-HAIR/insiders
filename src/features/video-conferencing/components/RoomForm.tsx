"use client";

import React, { useState, useEffect } from "react";
import { VideoProvider } from "@prisma/client";
import { X, Save, AlertCircle, Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { VideoSpace } from "../types/video-conferencing";
import {
  useCreateVideoSpace,
  useUpdateVideoSpace,
} from "../hooks/useVideoSpaces";
import { useIntegrationAccounts } from "../hooks/useIntegrationAccounts";

const roomFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  provider: z.nativeEnum(VideoProvider),
  alias: z
    .string()
    .min(3, "Alias must be at least 3 characters")
    .max(50, "Alias must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Alias can only contain letters, numbers, hyphens, and underscores"
    )
    .optional(),
  maxParticipants: z.number().min(1).max(1000).optional(),
  duration: z.number().min(1).max(1440).optional(), // Max 24 hours
  requiresAuth: z.boolean().default(false),
  recordingEnabled: z.boolean().default(false),
  chatEnabled: z.boolean().default(true),
  screenShareEnabled: z.boolean().default(true),
  waitingRoomEnabled: z.boolean().default(false),
  integrationAccountId: z.string().min(1, "Integration account is required"),
});

type RoomFormData = z.infer<typeof roomFormSchema>;

interface RoomFormProps {
  room?: VideoSpace;
  onSuccess: () => void;
  onCancel: () => void;
  initialProvider?: VideoProvider;
}

export const RoomForm: React.FC<RoomFormProps> = ({
  room,
  onSuccess,
  onCancel,
  initialProvider,
}) => {
  const [aliasAvailable, setAliasAvailable] = useState<boolean | null>(null);
  const [checkingAlias, setCheckingAlias] = useState(false);

  const isEditing = !!room;
  const createMutation = useCreateVideoSpace();
  const updateMutation = useUpdateVideoSpace();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      title: room?.title || "",
      description: room?.description || "",
      provider: room?.provider || initialProvider || VideoProvider.ZOOM,
      alias: room?.alias || "",
      maxParticipants: room?.maxParticipants || undefined,
      duration: room?.duration || undefined,
      requiresAuth: room?.requiresAuth || false,
      recordingEnabled: room?.recordingEnabled || false,
      chatEnabled: room?.chatEnabled ?? true,
      screenShareEnabled: room?.screenShareEnabled ?? true,
      waitingRoomEnabled: room?.waitingRoomEnabled || false,
      integrationAccountId: room?.integrationAccountId || "",
    },
  });

  const selectedProvider = watch("provider");
  const aliasValue = watch("alias");

  // Fetch integration accounts for the selected provider
  const { data: integrationAccounts, isLoading: accountsLoading } =
    useIntegrationAccounts({
      provider: selectedProvider,
    });

  // Check alias availability
  useEffect(() => {
    if (!aliasValue || aliasValue.length < 3 || isEditing) {
      setAliasAvailable(null);
      return;
    }

    const checkAlias = async () => {
      setCheckingAlias(true);
      try {
        const response = await fetch(
          `/api/video-spaces/check-alias?alias=${encodeURIComponent(aliasValue)}`
        );
        const data = await response.json();
        setAliasAvailable(data.available);
      } catch (error) {
        console.error("Error checking alias:", error);
        setAliasAvailable(null);
      } finally {
        setCheckingAlias(false);
      }
    };

    const timeoutId = setTimeout(checkAlias, 500);
    return () => clearTimeout(timeoutId);
  }, [aliasValue, isEditing]);

  // Set default integration account when provider changes
  useEffect(() => {
    if (integrationAccounts && integrationAccounts.length > 0 && !isEditing) {
      setValue("integrationAccountId", integrationAccounts[0].id);
    }
  }, [integrationAccounts, setValue, isEditing]);

  const onSubmit = async (data: RoomFormData) => {
    try {
      if (isEditing && room) {
        await updateMutation.mutateAsync({
          id: room.id,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving room:", error);
    }
  };

  const getProviderInfo = (provider: VideoProvider) => {
    switch (provider) {
      case "ZOOM":
        return {
          name: "Zoom",
          icon: "🔵",
          features: ["Waiting Room", "Recording", "Chat", "Screen Share"],
        };
      case "MEET":
        return {
          name: "Google Meet",
          icon: "🟢",
          features: ["Recording", "Chat", "Screen Share"],
        };
      case "VIMEO":
        return {
          name: "Vimeo",
          icon: "🔷",
          features: ["Recording", "Chat", "Screen Share"],
        };
      default:
        return { name: provider, icon: "📹", features: [] };
    }
  };

  const generateAlias = () => {
    const title = watch("title");
    if (title) {
      const alias = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 30);
      setValue("alias", alias);
    }
  };

  return (
    <div className='bg-white rounded-lg'>
      {/* Header */}
      <div className='flex items-center justify-between p-6 border-b border-gray-200'>
        <h2 className='text-xl font-semibold text-gray-900'>
          {isEditing ? "Edit Room" : "Create New Room"}
        </h2>
        <button
          onClick={onCancel}
          className='text-gray-400 hover:text-gray-600 p-1 rounded'
        >
          <X className='w-5 h-5' />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='p-6 space-y-6'>
        {/* Basic Information */}
        <div className='space-y-4'>
          <h3 className='text-lg font-medium text-gray-900'>
            Basic Information
          </h3>

          {/* Title */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Room Title *
            </label>
            <input
              {...register("title")}
              type='text'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Enter room title...'
            />
            {errors.title && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Description
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Optional description for the room...'
            />
            {errors.description && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Provider Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Video Provider *
            </label>
            <div className='grid grid-cols-3 gap-3'>
              {Object.values(VideoProvider).map((provider) => {
                const info = getProviderInfo(provider);
                return (
                  <label
                    key={provider}
                    className={`
                      relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        selectedProvider === provider
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <input
                      {...register("provider")}
                      type='radio'
                      value={provider}
                      className='sr-only'
                    />
                    <div className='text-2xl mb-2'>{info.icon}</div>
                    <div className='text-sm font-medium text-gray-900'>
                      {info.name}
                    </div>
                    {selectedProvider === provider && (
                      <div className='absolute top-2 right-2'>
                        <Check className='w-4 h-4 text-blue-600' />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Integration Account */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Integration Account *
            </label>
            {accountsLoading ? (
              <div className='flex items-center space-x-2 text-gray-500'>
                <Loader2 className='w-4 h-4 animate-spin' />
                <span>Loading accounts...</span>
              </div>
            ) : integrationAccounts && integrationAccounts.length > 0 ? (
              <select
                {...register("integrationAccountId")}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Select an account</option>
                {integrationAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountName} ({account.accountEmail})
                  </option>
                ))}
              </select>
            ) : (
              <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                <div className='flex items-start space-x-2'>
                  <AlertCircle className='w-4 h-4 text-yellow-600 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-yellow-800'>
                      No Integration Account
                    </p>
                    <p className='text-xs text-yellow-600 mt-1'>
                      You need to connect a{" "}
                      {getProviderInfo(selectedProvider).name} account first.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {errors.integrationAccountId && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.integrationAccountId.message}
              </p>
            )}
          </div>
        </div>

        {/* Room Settings */}
        <div className='space-y-4'>
          <h3 className='text-lg font-medium text-gray-900'>Room Settings</h3>

          {/* Alias */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Room Alias
            </label>
            <div className='flex space-x-2'>
              <div className='flex-1 relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <span className='text-gray-500 text-sm'>/</span>
                </div>
                <input
                  {...register("alias")}
                  type='text'
                  className='w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='my-room-alias'
                />
                {checkingAlias && (
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <Loader2 className='w-4 h-4 animate-spin text-gray-400' />
                  </div>
                )}
                {aliasAvailable === true && (
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <Check className='w-4 h-4 text-green-600' />
                  </div>
                )}
                {aliasAvailable === false && (
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <X className='w-4 h-4 text-red-600' />
                  </div>
                )}
              </div>
              <button
                type='button'
                onClick={generateAlias}
                className='px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Generate
              </button>
            </div>
            {aliasAvailable === false && (
              <p className='mt-1 text-sm text-red-600'>
                This alias is already taken
              </p>
            )}
            {errors.alias && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.alias.message}
              </p>
            )}
            <p className='mt-1 text-xs text-gray-500'>
              Optional friendly URL for your room (e.g., /my-room-alias)
            </p>
          </div>

          {/* Capacity and Duration */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Max Participants
              </label>
              <input
                {...register("maxParticipants", { valueAsNumber: true })}
                type='number'
                min='1'
                max='1000'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Unlimited'
              />
              {errors.maxParticipants && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.maxParticipants.message}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Duration (minutes)
              </label>
              <input
                {...register("duration", { valueAsNumber: true })}
                type='number'
                min='1'
                max='1440'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='No limit'
              />
              {errors.duration && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.duration.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Feature Settings */}
        <div className='space-y-4'>
          <h3 className='text-lg font-medium text-gray-900'>Features</h3>

          <div className='grid grid-cols-2 gap-4'>
            <label className='flex items-center space-x-3'>
              <input
                {...register("requiresAuth")}
                type='checkbox'
                className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
              />
              <span className='text-sm text-gray-700'>
                Require Authentication
              </span>
            </label>

            <label className='flex items-center space-x-3'>
              <input
                {...register("recordingEnabled")}
                type='checkbox'
                className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
              />
              <span className='text-sm text-gray-700'>Enable Recording</span>
            </label>

            <label className='flex items-center space-x-3'>
              <input
                {...register("chatEnabled")}
                type='checkbox'
                className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
              />
              <span className='text-sm text-gray-700'>Enable Chat</span>
            </label>

            <label className='flex items-center space-x-3'>
              <input
                {...register("screenShareEnabled")}
                type='checkbox'
                className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
              />
              <span className='text-sm text-gray-700'>Enable Screen Share</span>
            </label>

            {selectedProvider === "ZOOM" && (
              <label className='flex items-center space-x-3'>
                <input
                  {...register("waitingRoomEnabled")}
                  type='checkbox'
                  className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='text-sm text-gray-700'>
                  Enable Waiting Room
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center justify-end space-x-3 pt-6 border-t border-gray-200'>
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isSubmitting || (aliasValue && aliasAvailable === false)}
            className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Save className='w-4 h-4' />
            )}
            <span>{isEditing ? "Update Room" : "Create Room"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
