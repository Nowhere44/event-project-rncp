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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TabsContent } from '@/components/ui/tabs';

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
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(eventSchema),
        defaultValues: defaultValues ? {
            ...defaultValues,
            tags: defaultValues.simplifiedTags || [],
            start_time: new Date(defaultValues.start_time),
            end_time: new Date(defaultValues.end_time),
        } : {
            title: '',
            description: '',
            imageUrl: '',
            event_date: new Date(),
            start_time: new Date(),
            end_time: new Date(new Date().getTime() + 60 * 60 * 1000),
            location: '',
            latitude: null,
            longitude: null,
            capacity: 1,
            is_paid: false,
            price: 0,
            tags: [],
        },
    });

    const selectedDate = watch('event_date');
    const isPaid = watch('is_paid');
    const selectedTags = watch('tags');

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
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
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key !== 'imageUrl') {
                    formData.append(key, data[key]);
                }
            });
            formData.append('userId', userId);

            if (imageFile) {
                formData.append('image', imageFile);
            } else if (data.imageUrl) {
                formData.append('imageUrl', data.imageUrl);
            }

            const response = await fetch(`/api/events${eventId ? `/${eventId}` : ''}`, {
                method: eventId ? 'PUT' : 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit event');
            }

            const event = await response.json();
            router.push(`/events/${event.id}`);
        } catch (error) {
            console.error('Error submitting event:', error);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <TabsContent value="details">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">{`Titre de l'événement`}</label>
                        <Input
                            id="title"
                            {...register('title')}
                            placeholder="Titre de l'événement"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Description de l'événement"
                            className="h-32"
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message as string}</p>}
                    </div>

                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">{`Image de l'événement`}</label>
                        <div className="mt-1">
                            <Input
                                id="imageFile"
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                            />
                            <span className="text-sm text-gray-500">ou</span>
                            <Input
                                id="imageUrl"
                                {...register('imageUrl')}
                                placeholder="URL de l'image de l'événement"
                            />
                        </div>
                        {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message as string}</p>}
                        {(imagePreview || watch('imageUrl')) && (
                            <div className="mt-2">
                                <Image src={imagePreview || watch('imageUrl')} alt="Event image preview" width={200} height={200} className="rounded-lg" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="event_date" className="block text-sm font-medium text-gray-700">{`Date de l'événement`}</label>
                        <div className='-ml-4'>
                            <Controller
                                name="event_date"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        id="event_date"
                                        selected={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        dateFormat="EEEE dd MMMM yyyy"
                                        placeholderText="Date de l'événement"
                                        className="w-full p-2 border rounded-md"
                                        minDate={new Date()}
                                        locale={fr}
                                        customInput={
                                            <input
                                                className="w-full p-2 border rounded-md"
                                                value={field.value ? format(field.value, "EEEE 'le' d MMMM yyyy", { locale: fr }) : ''}
                                            />
                                        }
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">Heure de début</label>
                            <div className='-ml-4'>
                                <Controller
                                    name="start_time"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            id="start_time"
                                            selected={field.value}
                                            onChange={(date) => field.onChange(date)}
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Heure"
                                            dateFormat="HH:mm"
                                            placeholderText="Heure de début"
                                            className="w-full p-2 border rounded-md"
                                        />
                                    )}
                                /></div>

                        </div>

                        <div>
                            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">Heure de fin</label>
                            <div className='-ml-4'>
                                <Controller
                                    name="end_time"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            id="end_time"
                                            selected={field.value}
                                            onChange={(date) => field.onChange(date)}
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Heure"
                                            dateFormat="HH:mm"
                                            placeholderText="Heure de fin"
                                            className="w-full p-2 border rounded-md"
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="location">
                <div className='space-y-6'>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">{`Lieu de l'événement`}</label>
                    {isLoaded ? (
                        <input
                            id="location"
                            {...register('location')}
                            placeholder="Lieu de l'événement"
                            className="w-full p-2 border rounded-md"
                            defaultValue={defaultValues?.location || ''}
                            ref={(ref) => {
                                if (ref) {
                                    autocompleteRef.current = new google.maps.places.Autocomplete(ref);
                                    autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
                                }
                            }}
                        />
                    ) : (
                        <Input
                            id="location"
                            {...register('location')}
                            placeholder="Lieu de l'événement"
                            defaultValue={defaultValues?.location || ''}
                        />
                    )}
                    {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message as string}</p>}
                </div>

                <div className="mt-4">
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacité</label>
                    <Input
                        id="capacity"
                        type="number"
                        {...register('capacity', { valueAsNumber: true })}
                        placeholder="Capacité"
                        min={1}
                    />
                    {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity.message as string}</p>}
                </div>
            </TabsContent>

            <TabsContent value="tags">
                <div className='space-y-6'>
                    <h3 className="text-lg font-semibold">Tags</h3>
                    <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-gray-50 max-h-40 overflow-y-auto">
                        {availableTags.map((tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => {
                                    const newTags = selectedTags.includes(tag.name)
                                        ? selectedTags.filter((t: any) => t !== tag.name)
                                        : [...selectedTags, tag.name];
                                    setValue('tags', newTags);
                                }}
                                className={`px-3 py-1 rounded-full text-sm transition-all ${selectedTags.includes(tag.name)
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'
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
                            className="flex-grow"
                        />
                        <Button type="button" onClick={handleAddTag} className="whitespace-nowrap bg-orange-500">
                            Ajouter
                        </Button>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="pricing">
                <div className='space-y-6'>
                    <div className="flex items-center space-x-2">
                        <Controller
                            name="is_paid"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="is_paid"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <label htmlFor="is_paid" className="text-sm font-medium text-gray-700">Événement payant</label>
                    </div>

                    {isPaid && (
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Prix</label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                {...register('price', { valueAsNumber: true })}
                                placeholder="Prix"
                            />
                            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message as string}</p>}
                        </div>
                    )}
                </div>
            </TabsContent>

            <div className="flex justify-end space-x-4 mt-10">
                <Button type="button" onClick={() => router.back()} variant="outline">
                    Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-orange-500">
                    {isSubmitting ? 'Envoi en cours...' : eventId ? 'Mettre à jour' : 'Créer l\'événement'}
                </Button>
            </div>
        </form>
    );
};
export default EventForm;