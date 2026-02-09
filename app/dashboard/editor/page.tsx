'use client';

import BloxEditor from "@/app/ui/editor/blox-editor";
import {useState} from "react";

export default function Home() {
    const initialValue = 'Hello World!';
    const [value, setValue] = useState(initialValue);

    function _setValue(newValue: string) {
        console.log('Old', value, 'New', newValue);
        setValue(newValue);
    }

    return (
       <BloxEditor initialValue={initialValue} setValue={_setValue}/>
    )
}
