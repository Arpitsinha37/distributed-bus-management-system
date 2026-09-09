

import React, { useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { getData } from "../../services/apiService";
export default function Demo1({ formData, setFormData, index, clientData }) {
    const [options, setOptions] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    console.log("clientData", clientData);

    useEffect(() => {
        if (!inputValue) {
            setOptions([]);
            return;
        }
        setLoading(true);
        handlePassengerChange()
        // setFormData((prev) => ({ ...prev, clientName: inputValue }))
        const timer = setTimeout(() => {
            setOptions(
                clientData.filter((c) =>
                    c.name.toLowerCase().includes(inputValue.toLowerCase())
                )
            );
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [inputValue]);

    const handlePassengerChange = (value, isSelect) => {
        const updated = [...formData];
        if (isSelect) {
            updated[index] = value
        } else
            updated[index]["name"] = inputValue;
        setFormData(updated);
    };
    const handleSelect = (value) => {

        if (typeof value === "string") {
            console.log("New customer:", value);
            const newCustomer = { name: value, email: "", phone: "" };
            setSelected(newCustomer);
            alert("ddd")
            handlePassengerChange(value, false)
        } else {
            console.log("Existing customer:", value);
            setSelected(value);
            setInputValue(value.name);
            handlePassengerChange(value, true)
            // setFormData((prev) => ({ ...prev, clientName: value.name, email: value.email, phone: value.phone, clientID: value.id }));

        }
    };

    console.log("new ss", formData);

    return (
        <div className="w-full">
            <Combobox value={selected} onChange={handleSelect}>
                <div className="relative">

                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                        <Combobox.Input
                            className="w-full border-none py-2 pl-3 pr-10 text-gray-900 placeholder-gray-400 focus:ring-0"
                            placeholder="INPUT/SELECT CUSTOMER NAME"

                            displayValue={(option) => inputValue || option?.name || formData?.clientName}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            {loading ? (
                                <svg
                                    className="animate-spin h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4l5-5-5-5v4a10 10 0 00-10 10h4z"
                                    ></path>
                                </svg>
                            ) : (
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                            )}
                        </Combobox.Button>
                    </div>


                    {options.length > 0 && (
                        <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white border border-gray-200 shadow-lg z-10">
                            {options.map((person, idx) => (
                                <Combobox.Option
                                    key={idx}
                                    value={person}
                                    className={({ active }) =>
                                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                                        }`
                                    }
                                >
                                    {({ selected, active }) => (
                                        <>
                                            <div className="flex flex-col">
                                                <span
                                                    className={`truncate ${selected ? "font-medium" : "font-normal"
                                                        }`}
                                                >
                                                    {person.honorifics} {person.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {person.gender} • {person.age}
                                                </span>
                                            </div>
                                            {selected ? (
                                                <span
                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-blue-600" : "text-blue-600"
                                                        }`}
                                                >
                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Combobox.Option>
                            ))}
                        </Combobox.Options>
                    )}
                </div>
            </Combobox>
        </div>
    );
}
