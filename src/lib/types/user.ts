// User type matching database schema
export interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string | null;
	createdAt: Date;
	updatedAt: Date;
	// App-specific fields
	arrivalDate?: Date | string | null;
	role: string;
}

// Type for Better Auth session user
export interface SessionUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string | null;
	arrivalDate?: Date | string | null;
}
