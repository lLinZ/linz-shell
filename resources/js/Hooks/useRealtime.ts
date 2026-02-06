import { useEffect, useState } from 'react';

interface ModelEvent<T> {
    model: T;
    action: 'created' | 'updated' | 'deleted';
    model_name: string;
}

export function useRealtime<T extends { id: number }>(
    modelName: string,
    initialData: T[] = [],
    modelId?: number
) {
    const [data, setData] = useState<T[]>(initialData);

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    useEffect(() => {
        // Listen to the generic channel for list updates (creations)
        const channelName = `model.${modelName}`;
        const channel = window.Echo.channel(channelName);

        channel.listen('.model.updated', (e: ModelEvent<T>) => {
            // If listening to a specific ID, ignore irrelevant updates unless it's the one we're watching
            // logic is tricky for "list" vs "single item". 
            // This hook is primarily for LIST views.

            if (e.action === 'created') {
                setData((prev) => [...prev, e.model]);
            } else if (e.action === 'updated') {
                setData((prev) => prev.map((item) => (item.id === e.model.id ? e.model : item)));
            } else if (e.action === 'deleted') {
                setData((prev) => prev.filter((item) => item.id !== e.model.id));
            }
        });

        return () => {
            channel.stopListening('.model.updated');
        };
    }, [modelName]);

    return { data, setData };
}

// Hook for single item updates
export function useRealtimeItem<T extends { id: number }>(
    modelName: string,
    initialData: T
) {
    const [data, setData] = useState<T>(initialData);

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    useEffect(() => {
        if (!initialData?.id) return;

        const channelName = `model.${modelName}.${initialData.id}`;
        const channel = window.Echo.channel(channelName);

        channel.listen('.model.updated', (e: ModelEvent<T>) => {
            if (e.action === 'updated') {
                setData(e.model);
            }
            // Handling deleted for single item view usually requires redirect, handling in component
        });

        return () => {
            channel.stopListening('.model.updated');
        };
    }, [modelName, initialData?.id]);

    return data;
}
