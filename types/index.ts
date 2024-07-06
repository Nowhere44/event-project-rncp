// ====== USER PARAMS
export type CreateUserParams = {
    clerkId: string
    firstName: string
    lastName: string
    username: string
    email: string
    photo: string
}

export type UpdateUserParams = {
    firstName: string
    lastName: string
    username: string
    photo: string
}

// ====== EVENT PARAMS
export type CreateEventParams = {
    userId: string
    event: {
        title: string
        description: string
        location: string
        imageUrl: string
        startDateTime: Date
        endDateTime: Date
        categoryId: string
        price: string
        isFree: boolean
        url: string
    }
    path: string
}

export type UpdateEventParams = {
    userId: string
    event: {
        _id: string
        title: string
        imageUrl: string
        description: string
        location: string
        startDateTime: Date
        endDateTime: Date
        categoryId: string
        price: string
        isFree: boolean
        url: string
    }
    path: string
}

export type DeleteEventParams = {
    eventId: string
    path: string
}

export type GetAllEventsParams = {
    query: string
    category: string
    limit: number
    page: number
}

export type GetEventsByUserParams = {
    userId: string
    limit?: number
    page: number
}

export type GetRelatedEventsByCategoryParams = {
    categoryId: string
    eventId: string
    limit?: number
    page: number | string
}

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

// ====== CATEGORY PARAMS
export type CreateCategoryParams = {
    categoryName: string
}

// ====== ORDER PARAMS
export type CheckoutOrderParams = {
    eventTitle: string
    eventId: string
    price: string
    isFree: boolean
    buyerId: string
}

export type CreateOrderParams = {
    stripeId: string
    eventId: string
    buyerId: string
    totalAmount: string
    createdAt: Date
}

export type GetOrdersByEventParams = {
    eventId: string
    searchString: string
}

export type GetOrdersByUserParams = {
    userId: string | null
    limit?: number
    page: string | number | null
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

export type SearchParamProps = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export interface IEvent {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
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
    };
    reservations: IReservation[];
    availableTickets?: number; // Ajoutez cette ligne
}

export interface ITag {
    id: string;
    name: string;
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
    };
    event: {
        id: string;
        title: string;
        start_time: Date;
        end_time: Date;
        event_date: Date;
        reservationDate: Date;
        imageUrl?: string;
    };
    rating?: number;
    comment?: string;
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

}

export interface Message {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        first_name: string;
    };
}