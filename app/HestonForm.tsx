import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import React from "react";


type ApiResponse = Record<string, unknown>;

type Props = {
    fields: string[];
    activeField: string;
    onResult?: (data: ApiResponse) => void;
};


export default function HestonForm({ fields, onResult, activeField }: Props) {
    const [submitted, setSubmitted] = React.useState<
        Record<string, FormDataEntryValue> | null
    >(null);


    async function handlerHeston(payload: Record<string, FormDataEntryValue>) {
        const response = await fetch("http://localhost:8000/heston/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = (await response.json()) as ApiResponse;
        onResult?.(data);
    }


    async function handlerfBM(payload: Record<string, FormDataEntryValue>) {
        const response = await fetch("http://localhost:8000/fBM/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = (await response.json()) as ApiResponse;
        onResult?.(data);
    }

    async function handlerHeston2dPde(payload: Record<string, FormDataEntryValue>) {
        const response = await fetch("http://localhost:8000/heston2d/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = (await response.json()) as ApiResponse;
        // pass grid plus the numeric axes info so the chart can reconstruct S/V ranges
        onResult?.({
            ...data,
            NAS: Number(payload.NAS),
            NVS: Number(payload.NVS),
            K: Number(payload.K),
            T: Number(payload.T),
        });
    }



    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(e.currentTarget));

        setSubmitted(data);
        console.log(fields);
        switch (activeField) {
            case "heston":
                await handlerHeston(data);
                break;
            case "heston2dPDE":
                await handlerHeston2dPde(data);
                break;
            case "fBM":
                await handlerfBM(data);
                break;
            //case "McFBM": await handlerHeston(data)
        }

    };
    return (

        <Form onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-4">

                {fields.map((increment) => <Input
                    key={increment}
                    isRequired
                    errorMessage={`Enter a valid ${increment} value`}
                    label={increment}
                    labelPlacement="outside"
                    name={increment}
                    placeholder="Enter Drift  -1 < 1"
                />)}
            </div>
            <Button type="submit" variant="bordered">
                Submit Values
            </Button>
            <Button>
                Choose random Values
            </Button>
            {submitted && (
                <div className="text-small text-default-500">
                    You submitted: <code>{JSON.stringify(submitted)}</code>
                </div>
            )}
        </Form>
    );
}
