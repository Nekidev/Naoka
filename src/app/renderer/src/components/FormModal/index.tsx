"use client";

import { AnimatePresence } from "framer-motion";
import Modal from "../Modal";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface FormModalProps {
    isOpen: boolean;
    closeModal: () => void;
    title: string;
    subtitle?: string | null;
    fields: {
        name: string;
        label: string;
        type: "text";
        defaultValue: string;
        info?: string;
    }[];
    onSubmit: (result: { [key: string]: string }) => void;
    onDismiss?: () => void;
}

export default function FormModal(props: FormModalProps) {
    return (
        <AnimatePresence>
            {props.isOpen && <FormModalContent {...props} />}
        </AnimatePresence>
    );
}

function FormModalContent(props: FormModalProps) {
    return (
        <Modal closeModal={props.closeModal}>
            <div className="w-screen max-w-md bg-zinc-800 relative rounded overflow-x-hidden overflow-y-auto shadow-2xl p-4 flex flex-col gap-6">
                <div className="flex flex-row items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl leading-none">{props.title}</h2>
                        {props.subtitle && (
                            <div className="text-zinc-400 text-sm leading-none">
                                {props.subtitle}
                            </div>
                        )}
                    </div>
                    <button
                        className="p-2 -m-2"
                        onClick={() => {
                            props.onDismiss && props.onDismiss();
                            props.closeModal();
                        }}
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();

                        var values: { [key: string]: string } = {};

                        Array.from(
                            new FormData(e.target as HTMLFormElement).entries()
                        ).map(([key, value]) => {
                            values[key as keyof typeof values] =
                                value as string;
                        });

                        props.onSubmit(values);
                        props.closeModal();
                    }}
                    autoComplete="off"
                    className="flex flex-col items-stretch gap-4"
                >
                    {props.fields.map((field, index: number) => {
                        return (
                            <div
                                key={index}
                                className="flex flex-col gap-1 text-zinc-300"
                            >
                                <input
                                    type={field.type}
                                    name={field.name}
                                    placeholder={field.label}
                                    defaultValue={field.defaultValue}
                                    className="leading-none p-2 rounded bg-zinc-900 w-full border border-zinc-900 focus:border-zinc-100 transition placeholder:text-zinc-400"
                                    autoComplete="none"
                                />
                            </div>
                        );
                    })}
                    <div className="flex flex-row items-center justify-end gap-2 mt-2">
                        <button
                            className="py-2 px-4 leading-none bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600 transition"
                            type="button"
                            onClick={() => {
                                props.onDismiss && props.onDismiss();
                                props.closeModal();
                            }}
                        >
                            Discard
                        </button>
                        <button
                            className="py-2 px-4 leading-none bg-zinc-100 text-zinc-900 rounded hover:bg-zinc-300 transition"
                            type="submit"
                        >
                            Accept
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
