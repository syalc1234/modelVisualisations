import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import React from "react";


type Props = { fields: string[] };


export default function HestonForm({ fields }: Props) {
    const [submitted, setSubmitted] = React.useState<
        Record<string, FormDataEntryValue> | null
    >(null);



    async function handler(req: string) {
        console.log(req);
        const request: RequestInfo = new Request('http://localhost:8000/hello/', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: req
        })
        const response = await fetch(request);
        const data = await response.json();
        console.log(data);
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(e.currentTarget));

        setSubmitted(data);
    };
    return (

        <Form onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-4">

                {fields.map((increment) => <Input
                    key ={increment}
                    isRequired
                    errorMessage={`Enter a valid ${increment} value`}
                    label={increment}
                    labelPlacement="outside"
                    name={increment}
                    placeholder="Enter Drift  -1 < 1"
                />)}
            </div>
            <Button type="submit" variant="bordered" onPress={() => handler(JSON.stringify(submitted))}>
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

