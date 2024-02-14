// PopulationTable.jsx
import { useState, useEffect } from "react";
import axios from "axios";

import GetFriendship from "./GetFriendship";

const API_KEY = "6gclHnf4K8kkmv9KnptgvOEKJqFzieh8zViM1znp";
const baseUrl = "https://opendata.resas-portal.go.jp";

const axiosClient = axios.create({
    baseURL: baseUrl,
    headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json;charset=UTF-8',
    }
});


const prefectureData = [
    { "prefCode": 13, "prefName": "東京都" },
    { "prefCode": 14, "prefName": "神奈川県" },
    { "prefCode": 11, "prefName": "埼玉県" },
    { "prefCode": 12, "prefName": "千葉県" },
    { "prefCode": 8, "prefName": "茨城県" },
    { "prefCode": 9, "prefName": "栃木県" },
    { "prefCode": 10, "prefName": "群馬県" },
    { "prefCode": 19, "prefName": "山梨県" }
];

const PopulationTable = () => {




    const [populationByYear, setPopulationByYear] = useState({});
    const [years, setYears] = useState([]);
    const [members, setMembers] = useState([]);
    const [maxScore, setMaxScore] = useState(0);



    useEffect(() => {



        const fetchPopulationData = async () => {
            // Start by fetching all the data
            const allPopulationData = await Promise.all(prefectureData.map(async (prefecture) => {
                try {
                    const response = await axiosClient.get(`api/v1/population/sum/estimate?prefCode=${prefecture.prefCode}`);
                    // Attach the prefName to each data object
                    return response.data.result.data[0].data.map(dataPoint => ({
                        ...dataPoint,
                        prefName: prefecture.prefName
                    }));
                } catch (error) {
                    console.error(`Failed to fetch population data for ${prefecture.prefName}: ${error}`);
                    return [];
                }
            }));

            // Flatten the array of arrays and sort by year
            const flatPopulationData = allPopulationData.flat().sort((a, b) => a.year - b.year);

            // Use a reduce function to build an object indexed by year, then by prefecture
            const populationByYear = flatPopulationData.reduce((acc, { year, value, prefName }) => {
                if (!acc[year]) {
                    acc[year] = {};
                }
                acc[year][prefName] = value;
                return acc;
            }, {});

            // Extract the years for the table header
            const years = Array.from(new Set(flatPopulationData.map(item => item.year)));

            setPopulationByYear(populationByYear);
            setYears(years);
        };

        const fetchGetFriendshipData = async () => {
            const { bestGroup, maxScore } = await GetFriendship();
            setMembers(bestGroup);
            setMaxScore(maxScore);

        };



        fetchGetFriendshipData();
        fetchPopulationData();



    }, []);


    return (
        <>
            <table>
                <thead>
                    <tr>
                        <th>Year</th>
                        {prefectureData.map((prefecture) => (
                            <th key={prefecture.prefCode}
                                style={members && members.includes(prefecture.prefName) ? { backgroundColor: 'var(--color-max)' } :
                                    { backgroundColor: 'var(--color-min)' }}>{prefecture.prefName}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {years.sort().map(year => (
                        <tr key={year}>
                            <td>{year}</td>
                            {prefectureData.map(prefecture => (
                                <td key={prefecture.prefCode}
                                    style={members && members.includes(prefecture.prefName) ? { backgroundColor: 'var(--color-max)' }
                                        : { backgroundColor: 'var(--color-min)' }} >{populationByYear[year]?.[prefecture.prefName] || 'N/A'}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>

            </table>

            <ul style={{ maxWidth: "250px" }}>
                <li >
                    <p style={{ backgroundColor: "var(--color-max)" }}>友好度の総和が最大の<strong>色</strong> : {maxScore}</p>
                </li>
                <li >
                    <p style={{ backgroundColor: "var(--color-min)" }}>友好度の総和が最小の<strong>色</strong></p>
                </li>

            </ul>
        </>
    );
};

export default PopulationTable;



