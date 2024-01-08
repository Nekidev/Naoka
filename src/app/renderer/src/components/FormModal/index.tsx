"use client";

import { motion, AnimatePresence, steps } from "framer-motion";
import Modal from "../Modal";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React from "react";
import Input, { InputType } from "@/lib/forms";

export enum FormComponentType {
    Separator = "separator",
}

export type ComponentType = FormComponentType | InputType;

export interface FormComponent {
    type: FormComponentType;
}

export interface Step {
    title: string;
    subtitle?: string;
    fields: (Input | FormComponent)[];
}

interface FormModalProps {
    isOpen: boolean;
    closeModal: () => void;
    steps: Step[];
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
    const [currentStep, setCurrentStep] = React.useState(0);
    const formRef = React.useRef<HTMLFormElement | null>(null);

    return (
        <Modal closeModal={props.closeModal}>
            <div className="w-screen max-w-md bg-zinc-800 relative rounded overflow-x-hidden overflow-y-auto shadow-2xl p-4 flex flex-col gap-4">
                <form
                    ref={formRef}
                    onSubmit={(e) => e.preventDefault()}
                    autoComplete="off"
                    className="flex flex-col gap-4 relative"
                >
                    <div className="w-full flex flex-row overflow-hidden">
                        {props.steps.map((step, index: number) => {
                            return (
                                <div
                                    className="w-full min-w-full flex flex-col gap-4 transition-all"
                                    style={{
                                        marginLeft:
                                            index == 0
                                                ? `-${currentStep * 100}%`
                                                : `0`,
                                    }}
                                    key={index}
                                >
                                    <div className="flex flex-row items-start justify-between gap-4">
                                        <div className="flex flex-col gap-2">
                                            <h2 className="text-xl leading-none">
                                                {step.title}
                                            </h2>
                                            {step.subtitle && (
                                                <div className="text-zinc-400 text-sm leading-none">
                                                    {step.subtitle}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            className="p-2 -m-2"
                                            onClick={() => {
                                                props.onDismiss &&
                                                    props.onDismiss();
                                                props.closeModal();
                                            }}
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                    {step.fields.map((field, index: number) => {
                                        switch (field.type) {
                                            case InputType.Text:
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex flex-col gap-1 text-zinc-300"
                                                    >
                                                        <input
                                                            type={
                                                                field.valueType
                                                            }
                                                            name={field.name}
                                                            placeholder={
                                                                field.label
                                                            }
                                                            defaultValue={
                                                                field.defaultValue
                                                            }
                                                            className="leading-none p-2 rounded bg-zinc-900 w-full border border-zinc-900 focus:border-zinc-100 transition placeholder:text-zinc-400"
                                                            autoComplete="none"
                                                        />
                                                    </div>
                                                );

                                            case InputType.RadioGroup:
                                                return (
                                                    <div className="flex flex-col gap-4 items-stretch">
                                                        {field.options.map(
                                                            (option, index) => (
                                                                <RadioCard
                                                                    key={index}
                                                                    name={
                                                                        field.name
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                    title={
                                                                        option.label
                                                                    }
                                                                    description={
                                                                        option.description
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                );

                                            case InputType.CheckboxInput:
                                                return (
                                                    <div className="flex flex-col gap-4 items-stretch">
                                                        <CheckboxCard
                                                            key={index}
                                                            name={field.name}
                                                            title={field.label}
                                                            description={
                                                                field.description
                                                            }
                                                            defaultChecked={
                                                                field.defaultChecked
                                                            }
                                                        />
                                                    </div>
                                                );

                                            case FormComponentType.Separator:
                                                return (
                                                    <div className="w-full h-px bg-zinc-700"></div>
                                                );
                                        }
                                    })}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex flex-row items-center justify-end gap-2">
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
                        <div className="flex-1"></div>
                        <button
                            className="py-2 px-4 leading-none bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600 transition disabled:opacity-70 disabled:hover:bg-zinc-700 disabled:cursor-not-allowed"
                            type="button"
                            disabled={currentStep === 0}
                            onClick={() => {
                                if (currentStep != 0) {
                                    setCurrentStep((v) => v - 1);
                                }
                            }}
                        >
                            Previous
                        </button>
                        <button
                            className="py-2 px-4 leading-none bg-zinc-100 text-zinc-900 rounded hover:bg-zinc-300 transition"
                            type="button"
                            onClick={() => {
                                if (currentStep < props.steps.length - 1) {
                                    setCurrentStep((v) => v + 1);
                                } else {
                                    var values: { [key: string]: string } = {};

                                    Array.from(
                                        new FormData(
                                            formRef.current!
                                        ).entries()
                                    ).map(([key, value]) => {
                                        values[key as keyof typeof values] =
                                            value as string;
                                    });

                                    props.onSubmit(values);
                                    props.closeModal();
                                }
                            }}
                        >
                            {currentStep === props.steps.length - 1
                                ? "Accept"
                                : "Next"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

function RadioCard({
    title,
    description,
    name,
    value,
}: {
    title: string;
    description?: string;
    name: string;
    value: string;
}) {
    return (
        <label
            htmlFor={`${name}-${value}`}
            className={`p-2 rounded bg-zinc-850 flex flex-row items-start gap-2 hover:bg-zinc-900 transition cursor-pointer`}
        >
            <input
                type="radio"
                id={`${name}-${value}`}
                name={name}
                value={value}
                className="peer hidden"
            />
            <div className="ring-1 ring-offset-1 ring-zinc-100 ring-offset-zinc-850 h-2 w-2 m-2 peer-checked:bg-zinc-100 rounded-full transition"></div>
            <div className="flex-1 shrink-0 flex flex-col">
                <div className="text-zinc-300">{title}</div>
                {description && (
                    <div className="text-zinc-400 text-sm">{description}</div>
                )}
            </div>
        </label>
    );
}

function CheckboxCard({
    name,
    title,
    description,
    defaultChecked,
}: {
    name: string;
    title: string;
    description?: string;
    defaultChecked?: boolean;
}) {
    return (
        <label
            htmlFor={name}
            className={`${
                !!description &&
                "p-2 rounded bg-zinc-850 hover:bg-zinc-900 transition"
            } flex flex-row items-start gap-2 cursor-pointer`}
        >
            <input
                type="checkbox"
                id={name}
                name={name}
                className="peer hidden"
                defaultChecked={defaultChecked}
            />
            <div
                className={`border border-zinc-100 rounded w-3 h-3 peer-checked:bg-zinc-100 text-zinc-900 transition my-1.5 mr-1.5 ${
                    !!description && "mx-1.5"
                }`}
            >
                <CheckIcon className="h-2.5 w-2.5 stroke-2 transition" />
            </div>
            <div className="flex-1 shrink-0 flex flex-col">
                <div className="text-zinc-300">{title}</div>
                {description && (
                    <div className="text-zinc-400 text-sm">{description}</div>
                )}
            </div>
        </label>
    );
}
