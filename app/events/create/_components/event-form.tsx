'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema } from '@/lib/validations/event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLoadScript } from '@react-google-maps/api';

interface Tag {
    id: string;
    name: string;
}

type EventFormProps = {
    userId: string;
    eventId?: string;
    defaultValues?: any;
};

const EventForm = ({ userId, eventId, defaultValues }: EventFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [newTag, setNewTag] = useState('');
    const router = useRouter();
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(eventSchema),
        defaultValues: defaultValues ? {
            ...defaultValues,
            tags: defaultValues.simplifiedTags || [],
        } : {
            title: '',
            description: '',
            imageUrl: '',
            event_date: new Date(),
            start_time: new Date(),
            end_time: new Date(),
            location: '',
            latitude: null,
            longitude: null,
            capacity: 1,
            is_paid: false,
            price: 0,
            tags: [],
        },
    });

    const isPaid = watch('is_paid');
    const selectedTags = watch('tags');

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "AIzaSyBSn_yYew80D6BEGDN5vd37wZpmx4WAbsU",
        libraries: ["places"],
    });

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch('/api/tags');
                if (response.ok) {
                    const tags: Tag[] = await response.json();
                    setAvailableTags(tags);
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
        fetchTags();
    }, []);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/events${eventId ? `/${eventId}` : ''}`, {
                method: eventId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, userId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit event');
            }

            const event = await response.json();
            router.push(`/events/${event.id}`);
        } catch (error) {
            console.error('Error submitting event:', error);
            // Afficher l'erreur à l'utilisateur
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddTag = async () => {
        if (newTag.trim() !== '') {
            try {
                const response = await fetch('/api/tags', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newTag.trim() }),
                });
                if (response.ok) {
                    const createdTag: Tag = await response.json();
                    setAvailableTags([...availableTags, createdTag]);
                    setValue('tags', [...selectedTags, createdTag.name]);
                    setNewTag('');
                } else {
                    throw new Error('Failed to create tag');
                }
            } catch (error) {
                console.error('Error creating tag:', error);
            }
        }
    };

    const handlePlaceSelect = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            setValue('location', place.formatted_address || '');
            setValue('latitude', place.geometry?.location?.lat() || null);
            setValue('longitude', place.geometry?.location?.lng() || null);
        }
    };


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
                {...register('title')}
                placeholder="Titre de l'événement"
            />
            {errors.title && <p className="text-red-500">{errors.title.message as string}</p>}

            <Textarea
                {...register('description')}
                placeholder="Description de l'événement"
            />
            {errors.description && <p className="text-red-500">{errors.description.message as string}</p>}

            <Input
                {...register('imageUrl')}
                placeholder="URL de l'image de l'événement"
            />
            {errors.imageUrl && <p className="text-red-500">{errors.imageUrl.message as string}</p>}
            {watch('imageUrl') && (
                <Image src={watch('imageUrl')} alt="Event image" width={200} height={200} />
            )}

            <Controller
                name="event_date"
                control={control}
                render={({ field }) => (
                    <DatePicker
                        selected={field.value}
                        onChange={(date) => field.onChange(date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Date de l'événement"
                        className="w-full p-2 border rounded"
                    />
                )}
            />

            <Controller
                name="start_time"
                control={control}
                render={({ field }) => (
                    <DatePicker
                        selected={field.value}
                        onChange={(date) => field.onChange(date)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Heure"
                        dateFormat="HH:mm"
                        placeholderText="Heure de début"
                        className="w-full p-2 border rounded"
                    />
                )}
            />

            <Controller
                name="end_time"
                control={control}
                render={({ field }) => (
                    <DatePicker
                        selected={field.value}
                        onChange={(date) => field.onChange(date)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Heure"
                        dateFormat="HH:mm"
                        placeholderText="Heure de fin"
                        className="w-full p-2 border rounded"
                    />
                )}
            />


            {isLoaded ? (
                <div>
                    <input
                        {...register('location')}
                        placeholder="Lieu de l'événement"
                        className="w-full p-2 border rounded"
                        ref={(ref) => {
                            if (ref) {
                                autocompleteRef.current = new google.maps.places.Autocomplete(ref);
                                autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
                            }
                        }}
                    />
                </div>
            ) : (
                <input
                    {...register('location')}
                    placeholder="Lieu de l'événement"
                    className="w-full p-2 border rounded"
                />
            )}
            {errors.location && <p className="text-red-500">{errors.location.message as string}</p>}

            <Input
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                placeholder="Capacité"
            />
            {errors.capacity && <p className="text-red-500">{errors.capacity.message as string}</p>}

            <div className="flex items-center space-x-2">
                <Controller
                    name="is_paid"
                    control={control}
                    render={({ field }) => (
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    )}
                />
                <label htmlFor="is_paid">Événement payant</label>
            </div>

            {isPaid && (
                <Input
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="Prix"
                />
            )}
            {errors.price && <p className="text-red-500">{errors.price.message as string}</p>}

            <div>
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                    {availableTags.map((tag) => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                                const newTags = selectedTags.includes(tag.name)
                                    ? selectedTags.filter((t) => t !== tag.name)
                                    : [...selectedTags, tag.name];
                                setValue('tags', newTags);
                            }}
                            className={`px-3 py-1 rounded-full text-sm ${selectedTags.includes(tag.name)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Nouveau tag"
                    />
                    <Button type="button" onClick={handleAddTag}>Ajouter</Button>
                </div>
            </div>

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Envoi en cours...' : eventId ? 'Mettre à jour' : 'Créer l\'événement'}
            </Button>
        </form>
    );
};

export default EventForm;