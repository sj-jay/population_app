// GetFriendship.jsx
import Papa from 'papaparse';

const csvFilePath = '/friendship_level.csv';
let friendlinessScores = {};


export default async function GetFriendship() {

    const results = await new Promise((resolve, reject) => {
        Papa.parse(csvFilePath, {
            header: true,
            download: true,
            complete: function (results) {
                resolve(results);
            },
            error: (error) => {
                reject(error);
            }
        });
    });


    const friendships = results.data;
    const transformedData = transformData(friendships);
    return transformedData;
}

// transformData(friendships);



function transformData(data) {
    // Reset the friendlinessScores object to avoid accumulating results from multiple calls.
    friendlinessScores = {};

    // Skip the first row since it's the header, start processing from the second row.
    data.slice(1).forEach(row => {
        const fromRegion = row.Column1; // Correctly reference the 'from' region
        Object.keys(row).forEach((colKey, index) => {
            // Check if it's a valid score and not the 'fromRegion' itself or a hyphen.
            if (colKey !== "Column1" && row[colKey] !== "-") {
                // Map the column key to its corresponding region.
                // Assuming the first column (Col1) is 'fromRegion' and others are 'toRegions'.
                const toRegion = data[0][`Column${index + 1}`]; // Map index to region name based on the header row
                const scoreKey = `${fromRegion}-${toRegion}`;
                friendlinessScores[scoreKey] = parseInt(row[colKey], 10);
            }
        });
    });

    console.log(friendlinessScores);
    return findHighestScoringGroup();
}
// Function to calculate score for a given group
function calculateGroupScore(group) {
    let score = 0;
    for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
            let pairKey1 = `${group[i]}-${group[j]}`;
            let pairKey2 = `${group[j]}-${group[i]}`;
            score += friendlinessScores[pairKey1] || friendlinessScores[pairKey2] || 0;
        }
    }
    return score;
}

// Function to generate all combinations of groups
function generateCombinations(elements) {
    const combinations = [];
    const total = Math.pow(2, elements.length);
    for (let i = 1; i < total; i++) {
        const subset = [];
        for (let j = 0; j < elements.length; j++) {
            if (i & (1 << j)) {
                subset.push(elements[j]);
            }
        }
        if (subset.length > 0) {
            combinations.push(subset);
        }
    }
    return combinations;
}

// Main function to find the highest scoring group configuration
function findHighestScoringGroup() {
    const elements = ['東京都', '神奈川県', '埼玉県', '千葉県', '茨城県', '栃木県', '群馬県', '山梨県'];
    const allCombinations = generateCombinations(elements);
    let maxScore = -Infinity;
    let bestGroup = [];

    for (let i = 0; i < allCombinations.length; i++) {
        const group = allCombinations[i];
        const score = calculateGroupScore(group);
        if (score > maxScore) {
            maxScore = score;
            bestGroup = group;
        }
    }
    console.log(bestGroup, maxScore);

    return { bestGroup, maxScore };
}
