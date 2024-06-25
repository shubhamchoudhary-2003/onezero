import { Label } from "@medusajs/ui";
import React, { useEffect, useImperativeHandle, useState } from "react";
import Eye from "../../common/icons/eye";
import EyeOff from "../../common/icons/eye-off";
import _ from "lodash";

type InputProps = Omit<
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    "placeholder"
> & {
    label: string;
    errors?: Record<string, unknown>;
    touched?: Record<string, unknown>;
    name: string;
    topLabel?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ type, name, label, touched, required, topLabel, ...props }, ref) => {
        const inputRef = React.useRef<HTMLInputElement>(null);
        const [showPassword, setShowPassword] = useState(false);
        const [inputType, setInputType] = useState(type);

        useEffect(() => {
            if (type === "password" && showPassword) {
                setInputType("text");
            }

            if (type === "password" && !showPassword) {
                setInputType("password");
            }
        }, [type, showPassword]);

        useImperativeHandle(ref, () => inputRef.current!);

        return (
            <div className="m-2 flex flex-auto w-full border border-gray-600">
                {topLabel && (
                    <Label className="pl-1 txt-compact-medium-plus w-1/3 text-center p-3 ">
                        {_.capitalize(topLabel)}
                    </Label>
                )}
                <div className="flex relative z-0 txt-compact-medium w-2/3 h-9/10">
                    <input
                        type={inputType}
                        name={name}
                        placeholder={_.capitalize(label)}
                        required={required}
                        {...props}
                        className="border border-gray-100 pt-1 pb-1 block w-full h-11 px-4 mt-0 text-white bg-[#14202A] rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active overflow-hidden"
                        ref={inputRef}
                    />
                    {/* <label
                          htmlFor={name}
                        onClick={(): void => inputRef.current?.focus()}
                        className="flex items-center justify-center mx-3 px-1 transition-all absolute duration-300 -z-1 origin-0 text-ui-fg-subtle"
                    >
                        {label}
                        {required && <span className="text-rose-500">*</span>}
                    </label> */}
                    {type === "password" && (
                        <button
                            type="button"
                            onClick={(): void => setShowPassword(!showPassword)}
                            className="text-ui-fg-subtle px-4 focus:outline-none transition-all duration-150 outline-none focus: absolute right-0 top-3"
                        >
                            {showPassword ? <Eye /> : <EyeOff />}
                        </button>
                    )}
                </div>
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
