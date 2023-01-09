import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import moment from "moment"
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai"

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartData,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

const socket = io("http://localhost:3001")

interface CurrentDataProp {
    current: number
    id: number
    timestamp: string
}

function App() {
    const MAX = 30
    const MIN = 5
    const [currentData, setCurrentData] = useState([] as CurrentDataProp[])
    const [thresholdVal, setThresholdVal] = useState(15)
    const recentVal = useRef(0)
    const currentSign = useRef("" as "rise" | "fall")
    const [isOverLimit, setIsOverLimit] = useState(false)
    const [avgCurrent, setAvgCurrent] = useState(0)

    useEffect(() => {
        socket.emit("client-ready")

        socket.on("query-error", (err) => {
            console.log(err)
        })

        socket.on("electricity_data", (data: CurrentDataProp[]) => {
            currentSign.current =
                data[0].current > recentVal.current ? "rise" : "fall"
            data.sort((x, y) => x.id - y.id)
            setCurrentData(data)
        })

        return () => {
            socket.off("query-error")
            socket.off("electricity_data")
        }
    }, [])

    useEffect(() => {
        if (currentData) {
            if (currentData[99]?.current > thresholdVal) setIsOverLimit(true)
            setIsOverLimit(false)

            const avgData =
                currentData.reduce((pre, curr) => {
                    return curr.current + pre
                }, 0) / 100

            setAvgCurrent(avgData)
        }
    }, [thresholdVal, currentData])

    const handleThreshold = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value)
        if (val > MAX) return setThresholdVal(MAX)
        setThresholdVal(val)
    }

    //        Graph Options & Data

    const options = {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Energy Reading",
            },
        },
    }

    const labels = currentData.map((data) =>
        moment(data.timestamp).format("hh:mm")
    )

    const data: ChartData<"line", any[], string> = {
        labels,
        datasets: [
            {
                fill: true,
                label: "Current",
                data: currentData.map((data) => ({
                    x: moment(data.timestamp).format("hh:mm"),
                    y: data.current,
                })),
                borderColor: "rgb(55, 209, 132)",
                backgroundColor: "rgb(55, 209, 132,.5)",
            },
            {
                label: "Threshold",
                data: currentData.map((data) => ({
                    x: moment(data.timestamp).format("hh:mm"),
                    y: thresholdVal,
                })),
                borderColor: "rgb(205, 30, 60)",
                pointBackgroundColor: "transparent",
                pointBorderColor: "transparent",
            },
        ],
    }

    return (
        <div className=" bg-[url('bg.svg')] min-h-screen bg-no-repeat bg-cover flex flex-col  items-center p-10">
            {/*   Title   */}
            <h1 className="text-4xl text-amber-600 font-bold px-10 py-3 bg-white border-2 border-black shadow-lg rounded-lg">
                Electricity Monitor
            </h1>
            {/*    Graph    */}
            <div className="p-2 bg-white w-full h-[40vh] rounded-lg border-2 border-black shadow-black/50 shadow-lg mt-10">
                <Line options={options} data={data} className="h-full" />
            </div>

            {currentData.length > 0 && (
                <div className="mt-10 flex justify-around">
                    {/*     Threshold Value   */}
                    <div className="bg-white p-3 rounded-lg border-2 border-black flex flex-col gap-y-2  shadow-md shadow-black/40">
                        <h1>Set Threshold Value</h1>
                        <input
                            type="number"
                            min={MIN}
                            max={MAX}
                            value={thresholdVal}
                            onChange={(e) => handleThreshold(e)}
                            className="text-xl text-center p-2 outline-0 border-b-2 border-black "
                        />
                    </div>

                    {/*       Report     */}
                    <div className="bg-white p-2">
                        <div className="flex">
                            <h1>Current :</h1>
                            <h1 className="inline-flex">
                                {currentData[99].current}
                                {currentSign.current == "rise" ? (
                                    <AiFillCaretUp className="text-red-600" />
                                ) : (
                                    <AiFillCaretDown className="text-emerald-600" />
                                )}{" "}
                            </h1>
                        </div>

                        <div className="flex">
                            <h1>Avg Current :</h1>
                            <h1 className="inline-flex">{avgCurrent}</h1>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
