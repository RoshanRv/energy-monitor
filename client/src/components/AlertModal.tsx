import moment from "moment"
import React from "react"
import { CgCloseO } from "react-icons/cg"

const AlertModal = ({
    powerVal,
    time,
    hide,
}: {
    powerVal: number
    time: string
    hide: (val: boolean) => void
}) => {
    return (
        <main className="fixed bg-black/80 top-0 left-0 w-full h-screen flex justify-center items-center">
            <div className="bg-white p-8 px-10 border-2 border-black shadow-md shadow-black/50 rounded-md text-center relative">
                {/* Close */}
                <button
                    onClick={() => hide(true)}
                    className="absolute text-2xl top-2 right-3"
                >
                    <CgCloseO />
                </button>
                <h1 className="text-5xl font-bold bg-red-700 text-white px-6 py-3">
                    Energy Consumption Exceeded !!!
                </h1>
                {/*  */}
                <div className="flex gap-x-4 w-max mx-auto my-4 tex-2xl text-center ">
                    <h1>Recent Power Value :</h1>
                    <h1>{powerVal}</h1>
                </div>
                <div className="flex gap-x-4 w-max mx-auto my-4 tex-2xl text-center ">
                    <h1>Time :</h1>
                    <h1>{moment(time).format("hh:mm DD/MM")}</h1>
                </div>
            </div>
        </main>
    )
}

export default AlertModal
