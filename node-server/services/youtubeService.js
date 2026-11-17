
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

/**
 * Search YouTube for educational videos.
 *
 * @param {Object} options
 * @param {string} options.topic
 * @param {string} options.grade
 * @param {string} options.subject
 * @param {number} options.limit
 * @returns {Promise<Array>}
 */
export async function searchYouTubeVideos({
    topic,
    grade = "",
    subject = "",
    limit = 5
} = {}) {

    // Do not search without a meaningful topic.
    if (!topic || typeof topic !== "string" || !topic.trim()) {
        return [];
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        console.warn("[YouTube] YOUTUBE_API_KEY is not configured.");
        return [];
    }

    // Keep the result count between 1 and 5.
    const maxResults = Math.min(
        5,
        Math.max(1, Number.parseInt(limit, 10) || 5)
    );

    // Construct a learner-focused search query.
    const searchTerms = [
        topic.trim(),
        grade && `${grade} level`,
        subject && subject.trim(),
        "educational learning"
    ].filter(Boolean);

    const query = searchTerms.join(" ");

    const params = new URLSearchParams({
        part: "snippet",
        q: query,
        type: "video",
        videoEmbeddable: "true",
        videoSyndicated: "true",
        safeSearch: "strict",
        relevanceLanguage: "en",
        regionCode: "IN",
        order: "relevance",
        maxResults: String(maxResults),
        key: apiKey
    });

    try {
        const response = await fetch(
            `${YOUTUBE_API_URL}?${params.toString()}`,
            {
                method: "GET",
                signal: AbortSignal.timeout(10000)
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            console.error(
                "[YouTube] API request failed:",
                response.status,
                errorData.error?.message || response.statusText
            );

            return [];
        }

        const data = await response.json();

        if (!Array.isArray(data.items)) {
            return [];
        }

        const videos = data.items
            .filter(item => item.id?.videoId)
            .map(item => {
                const snippet = item.snippet || {};
                const videoId = item.id.videoId;

                return {
                    videoId,
                    title: snippet.title || "",
                    description: snippet.description || "",
                    channelTitle: snippet.channelTitle || "",
                    thumbnailUrl:
                        snippet.thumbnails?.medium?.url ||
                        snippet.thumbnails?.default?.url ||
                        "",
                    publishedAt: snippet.publishedAt || "",
                    embedUrl:
                        `https://www.youtube-nocookie.com/embed/${videoId}`,
                    watchUrl:
                        `https://www.youtube.com/watch?v=${videoId}`
                };
            });

        console.log(
            `[YouTube] Found ${videos.length} videos for: ${query}`
        );

        return videos;

    } catch (error) {
        // YouTube must never interrupt the existing learning response.
        console.error("[YouTube] Search unavailable:", error.message);
        return [];
    }
}
