// friendliness_checker.jsx
import Papa from 'papaparse';

const csvFilePath = '/friendship_level.csv';
let friendlinessScores = {};

export default function GetFriendship() {
    Papa.parse(csvFilePath, {
        header: true,
        download: true,
        complete: function (results) {
            const friendships = results.data;
            transformData(friendships);
        }
    });

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

        // console.log(friendlinessScores);
        calculateMaximumTotalFriendship();
    }

    // Assuming friendlinessScores is populated as in the previous step
    let groups = [];
    let currentGroupIndex = 0; // Start with the first group

    let maximumTotalFriendshipPrefectures = [];

    function calculateMaximumTotalFriendship() {

        // Convert friendlinessScores to an array and sort by score descending
        const scoresArray = Object.entries(friendlinessScores).sort((a, b) => b[1] - a[1]);

        // Initialize groups with empty structures
        for (let i = 0; i < 2; i++) {
            groups.push({ members: [], totalFriendliness: 0 });
        }

        scoresArray.forEach(([key, value]) => {
            // Try to add the score to an existing group without exceeding the max total or start a new one if possible
            let added = false;
            for (let i = 0; i < groups.length; i++) {
                if (groups[i].totalFriendliness + value <= 100) {
                    groups[i].members.push(key);
                    groups[i].totalFriendliness += value;
                    added = true;
                    break;
                }
            }

            // If we can't add the score to any group without exceeding the max, we might need to skip it
            // This is a simplification and might not be optimal
            if (!added && currentGroupIndex < 2) {
                // Move to the next group if we haven't exceeded the group limit
                // This block is intentionally left empty for this simplified logic
                // In a more complex solution, you might rearrange groups or scores here
            }
        });

        // Filter out any groups that ended up empty
        groups = groups.filter(group => group.members.length > 0);

        console.log("Groups:", groups);

        MaximumTotalFriendshipPrefectures();

    }

    function MaximumTotalFriendshipPrefectures() {
        groups.forEach(group => {
            if (group.totalFriendliness === 100) {
                group.members.forEach(member => {
                    const prefectures = member.split('-');
                    prefectures.forEach(prefecture => {
                        if (!maximumTotalFriendshipPrefectures.includes(prefecture)) {
                            maximumTotalFriendshipPrefectures.push(prefecture);
                        }
                    })
                })
            }
        });

        console.log(maximumTotalFriendshipPrefectures);
    }


    return maximumTotalFriendshipPrefectures;

}