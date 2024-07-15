import Image from 'next/image';

// ====== EVENT PARAMS
export type Event = {
    _id: string
    title: string
    description: string
    price: string
    isFree: boolean
    imageUrl: string
    location: string
    startDateTime: Date
    endDateTime: Date
    url: string
    organizer: {
        _id: string
        firstName: string
        lastName: string
    }
    category: {
        _id: string
        name: string
    }
}

// ====== URL QUERY PARAMS
export type UrlQueryParams = {
    params: string
    key: string
    value: string | null
}

export type RemoveUrlQueryParams = {
    params: string
    keysToRemove: string[]
}

export interface IEvent {
    id: string;
    title: string;
    description: string;
    start_time: Date;
    end_time: Date;
    event_date: Date;
    location: string;
    is_paid: boolean;
    price?: number;
    capacity: number;
    userId: string;
    created_at: Date;
    updated_at: Date;
    latitude: number;
    longitude: number;
    averageRating?: number;
    isOnline: boolean;
    tags?: {
        tag: {
            id: string;
            name: string;
        };
        eventId: string;
        tagId: string;
    }[];
    user?: {
        id: string;
        first_name: string;
        last_name: string;
        averageRating?: number;
        isVerified: boolean;
    };
    reservations: IReservation[];
    availableTickets?: number;
    images: Image[];
    imageUrl: string | null;
}

export interface Image {
    url: string;
    order: number;
    eventId: string;
    id: string;
}


export interface IReservation {
    id: string;
    numberOfTickets: number;
    totalAmount: number;
    eventId: string;
    userId: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        profile_picture?: string;
        date_of_birth?: Date;
    };
    event: {
        id: string;
        title: string;
        start_time: Date;
        end_time: Date;
        event_date: Date;
        reservationDate: Date;
        images: Image[];
    };
    rating?: number;
    comment?: string;
    createdAt: Date;
    appliedPromoCode?: string;
}

export interface IRating {
    id: string;
    reservationId: string;
    eventId: string;
    userId: string;
    rating: number;
    comment?: string;
    createdAt: Date;
}


export interface IUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture?: string;
    role: string;
    totalRevenue?: number;
    date_of_birth?: Date;
    description?: string;
    isVerified: boolean;
    twoFactorEnabled: boolean;
}

export interface Message {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        first_name: string;
    };
}