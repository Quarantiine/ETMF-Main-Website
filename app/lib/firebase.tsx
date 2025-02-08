"use client";

import { useEffect, useRef, useState } from "react";
import { FirebaseApp, initializeApp } from "firebase/app";
import {
	addDoc,
	collection,
	CollectionReference,
	Firestore,
	getFirestore,
	onSnapshot,
} from "firebase/firestore";
import { ContactFormData } from "./types";

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

const colRefFormMessage: CollectionReference = collection(
	db,
	"contact-form-messages"
);

export const FirebaseAPI = () => {
	const [inquiries, setInquiries] = useState<ContactFormData[]>();
	const [inquiriesLoading, setInquiriesLoading] = useState<boolean>(false);

	const [formMessageLoading, setFormMessageLoading] = useState<boolean>(false);
	const [formMessageError, setFormMessageError] = useState<string>("");

	const formMessageErrorRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		try {
			setInquiriesLoading(true);

			onSnapshot(colRefFormMessage, (ss) => {
				setInquiries(
					ss.docs.map((doc) => ({
						...doc.data(),
						id: doc.id,
						name: doc.data().name,
						email: doc.data().email,
						message: doc.data().message,
						contact: doc.data().contact,
						category: doc.data().category,
					}))
				);
			});
		} catch (error) {
			console.error(error);
		} finally {
			setInquiriesLoading(false);
		}
	}, []);

	class ContactFormSystem {
		constructor() {}

		sendMessage = async (
			name: string,
			email: string,
			message: string,
			contact: string,
			category: string
		) => {
			try {
				if (formMessageErrorRef.current)
					clearTimeout(formMessageErrorRef.current);

				setFormMessageLoading(true);

				await addDoc(colRefFormMessage, {
					name: name,
					email: email,
					message: message,
					contact: contact,
					category: category,
				});

				setFormMessageError("");
			} catch (error) {
				setFormMessageError((error as Error).message);

				formMessageErrorRef.current = setTimeout(() => {
					setFormMessageError("");
				}, 5000);
			} finally {
				setFormMessageLoading(false);
			}
		};
	}

	const CFS = new ContactFormSystem();
	const sendMessage = CFS.sendMessage;

	return {
		contactFormSession: {
			inquiriesLoading,
			inquiries,
			sendMessage,
			formMessageLoading,
			formMessageError,
		},
	};
};
