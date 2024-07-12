'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TabsContent } from '@/components/ui/tabs';
import { useLoadScript } from '@react-google-maps/api';
import { Libraries } from '@react-google-maps/api/dist/utils/make-load-script-url';
import { format, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';


registerLocale('fr', fr);

const libraries: Libraries = ["places"];

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
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>(defaultValues?.imageUrls || []);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const { register, handleSubmit, control, watch, setError, setValue, formState: { errors } } = useForm({
        defaultValues: defaultValues ? {
            ...defaultValues,
            tags: defaultValues.simplifiedTags || [],
            start_time: new Date(defaultValues.start_time),
            end_time: new Date(defaultValues.end_time),
            isOnline: defaultValues.isOnline || false,
            meetingType: defaultValues.meetingType || null,
            meetingLink: defaultValues.meetingLink || '',
        } : {
            title: '',
            description: '',
            event_date: new Date(),
            start_time: setHours(setMinutes(new Date(), 0), 9),
            end_time: setHours(setMinutes(new Date(), 0), 18),
            location: '',
            latitude: null,
            longitude: null,
            capacity: 1,
            is_paid: false,
            price: 0,
            tags: [],
            isOnline: false,
            meetingType: null,
            meetingLink: '',
        },
    });

    const isPaid = watch('is_paid');
    const selectedTags = watch('tags');
    const isOnline = watch('isOnline');
    const meetingType = watch('meetingType');

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries: libraries,
    });


    useEffect(() => {
        if (defaultValues?.imageUrls) {
            setImageUrls(defaultValues.imageUrls);
        }
    }, [defaultValues]);

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

    const handlePlaceSelect = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            setValue('location', place.formatted_address || '');
            setValue('latitude', place.geometry?.location?.lat() || null);
            setValue('longitude', place.geometry?.location?.lng() || null);
        }
    };

    const removeImage = (index: number, type: 'file' | 'url') => {
        if (type === 'file') {
            setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
            setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
        } else {
            setImageUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
        }
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'tags') {
                    formData.append(key, JSON.stringify(data[key]));
                } else if (key === 'event_date' || key === 'start_time' || key === 'end_time') {
                    formData.append(key, data[key] instanceof Date ? data[key].toISOString() : data[key]);
                } else if (typeof data[key] === 'boolean') {
                    formData.append(key, data[key].toString());
                } else if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });
            formData.append('userId', userId);

            formData.append('existingImageUrls', JSON.stringify(imageUrls));

            imageFiles.forEach((file, index) => {
                formData.append(`imageFile`, file);
            });

            const url = `/api/events${eventId ? `/${eventId}` : ''}`;
            const method = eventId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit event');
            }

            const event = await response.json();
            router.push(`/events/${event.id}`);
            router.refresh();
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).slice(0, 5 - imageUrls.length - imagePreviews.length);
        setImageFiles(prevFiles => [...prevFiles, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    };

    const handleImageUrlAdd = () => {
        const url = watch('newImageUrl');
        if (url && imageUrls.length + imageFiles.length + imagePreviews.length < 5 && !imageUrls.includes(url)) {
            setImageUrls(prevUrls => [...prevUrls, url]);
            setValue('newImageUrl', '');
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
                        <label className="block text-sm font-medium text-gray-700">{`Images de l'événement (max 5)`}</label>
                        <div className="mt-1 space-y-2">
                            <Input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={imageUrls.length + imageFiles.length >= 5}
                            />
                            <div className="flex items-center space-x-2">
                                <Input
                                    {...register('newImageUrl')}
                                    placeholder="URL de l'image"
                                    disabled={imageUrls.length + imageFiles.length >= 5}
                                />
                                <Button type="button" onClick={handleImageUrlAdd} disabled={imageUrls.length + imageFiles.length >= 5}>
                                    Ajouter URL
                                </Button>
                            </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {imagePreviews.map((preview, index) => (
                                <div key={`file-${index}`} className="relative">
                                    <Image src={preview} alt={`Preview ${index + 1}`} width={100} height={100} className="rounded-lg" />
                                    <button type="button" onClick={() => removeImage(index, 'file')} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
                                        X
                                    </button>
                                </div>
                            ))}
                            {imageUrls.map((url, index) => (
                                <div key={`url-${index}`} className="relative">
                                    <Image src={url} alt={`URL Image ${index + 1}`} width={100} height={100} className="rounded-lg" />
                                    <button type="button" onClick={() => removeImage(index, 'url')} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
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
                                        onChange={(date) => {
                                            field.onChange(date);
                                            const currentStartTime = watch('start_time');
                                            const currentEndTime = watch('end_time');
                                            setValue('start_time', setHours(setMinutes(date as Date, currentStartTime.getMinutes()), currentStartTime.getHours()));
                                            setValue('end_time', setHours(setMinutes(date as Date, currentEndTime.getMinutes()), currentEndTime.getHours()));
                                        }}
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
                                            onChange={(date) => {
                                                const eventDate = watch('event_date');
                                                field.onChange(setHours(setMinutes(eventDate, date?.getMinutes() || 0), date?.getHours() || 0));
                                            }}
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Heure"
                                            dateFormat="HH:mm"
                                            placeholderText="Heure de début"
                                            className="w-full p-2 border rounded-md"
                                            locale={fr}
                                        />
                                    )}
                                />
                            </div>
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
                                            onChange={(date) => {
                                                const eventDate = watch('event_date');
                                                field.onChange(setHours(setMinutes(eventDate, date?.getMinutes() || 0), date?.getHours() || 0));
                                            }}
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Heure"
                                            dateFormat="HH:mm"
                                            placeholderText="Heure de fin"
                                            className="w-full p-2 border rounded-md"
                                            locale={fr}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center space-x-2">
                            <Checkbox
                                checked={isOnline}
                                onCheckedChange={(checked) => setValue('isOnline', checked as boolean)}
                            />
                            <span>Événement en ligne</span>
                        </label>
                    </div>
                    {isOnline && (
                        <div>
                            <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700">Type de réunion</label>
                            <Select
                                value={meetingType || ''}
                                onValueChange={(value) => setValue('meetingType', value as 'EXTERNAL' | 'INTEGRATED')}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choisir le type de réunion" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EXTERNAL">Lien externe</SelectItem>
                                    <SelectItem value="INTEGRATED">Utiliser notre plateforme</SelectItem>
                                </SelectContent>
                            </Select>

                            {meetingType === 'EXTERNAL' && (
                                <div className="mt-2">
                                    <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700">Lien de la réunion</label>
                                    <Input
                                        id="meetingLink"
                                        type="url"
                                        {...register('meetingLink')}
                                        placeholder="https://exemple.com/reunion"
                                    />
                                </div>
                            )}
                        </div>
                    )}
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
                        <Button type="button" onClick={handleAddTag} className="whitespace-nowrap">
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
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2"
                >
                    {isSubmitting ? 'Envoi en cours...' : eventId ? 'Mettre à jour' : 'Créer l\'événement'}
                </Button>
            </div>
        </form>
    );
};

export default EventForm;