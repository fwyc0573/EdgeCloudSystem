"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentials = exports.endpoint = exports.region = exports.MockSha256 = void 0;
class MockSha256 {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(secret) { }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(data) { }
    digest() {
        return Promise.resolve(new Uint8Array(5));
    }
}
exports.MockSha256 = MockSha256;
const region = () => Promise.resolve("mock-region");
exports.region = region;
const endpoint = () => Promise.resolve({
    protocol: "https:",
    path: "/",
    hostname: "ec2.mock-region.amazonaws.com",
});
exports.endpoint = endpoint;
const credentials = () => Promise.resolve({
    accessKeyId: "akid",
    secretAccessKey: "secret",
    sessionToken: "session",
});
exports.credentials = credentials;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4dHVyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9maXh0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLE1BQWEsVUFBVTtJQUNyQiw2REFBNkQ7SUFDN0QsWUFBWSxNQUErQyxJQUFHLENBQUM7SUFDL0QsNkRBQTZEO0lBQzdELE1BQU0sQ0FBQyxJQUFpQixJQUFHLENBQUM7SUFDNUIsTUFBTTtRQUNKLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVDLENBQUM7Q0FDRjtBQVJELGdDQVFDO0FBRU0sTUFBTSxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUE5QyxRQUFBLE1BQU0sVUFBd0M7QUFFcEQsTUFBTSxRQUFRLEdBQUcsR0FBRyxFQUFFLENBQzNCLE9BQU8sQ0FBQyxPQUFPLENBQUM7SUFDZCxRQUFRLEVBQUUsUUFBUTtJQUNsQixJQUFJLEVBQUUsR0FBRztJQUNULFFBQVEsRUFBRSwrQkFBK0I7Q0FDMUMsQ0FBQyxDQUFDO0FBTFEsUUFBQSxRQUFRLFlBS2hCO0FBRUUsTUFBTSxXQUFXLEdBQUcsR0FBRyxFQUFFLENBQzlCLE9BQU8sQ0FBQyxPQUFPLENBQUM7SUFDZCxXQUFXLEVBQUUsTUFBTTtJQUNuQixlQUFlLEVBQUUsUUFBUTtJQUN6QixZQUFZLEVBQUUsU0FBUztDQUN4QixDQUFDLENBQUM7QUFMUSxRQUFBLFdBQVcsZUFLbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTb3VyY2VEYXRhIH0gZnJvbSBcIkBhd3Mtc2RrL3R5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBNb2NrU2hhMjU2IHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICBjb25zdHJ1Y3RvcihzZWNyZXQ/OiBzdHJpbmcgfCBBcnJheUJ1ZmZlciB8IEFycmF5QnVmZmVyVmlldykge31cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICB1cGRhdGUoZGF0YT86IFNvdXJjZURhdGEpIHt9XG4gIGRpZ2VzdCgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBVaW50OEFycmF5KDUpKTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgcmVnaW9uID0gKCkgPT4gUHJvbWlzZS5yZXNvbHZlKFwibW9jay1yZWdpb25cIik7XG5cbmV4cG9ydCBjb25zdCBlbmRwb2ludCA9ICgpID0+XG4gIFByb21pc2UucmVzb2x2ZSh7XG4gICAgcHJvdG9jb2w6IFwiaHR0cHM6XCIsXG4gICAgcGF0aDogXCIvXCIsXG4gICAgaG9zdG5hbWU6IFwiZWMyLm1vY2stcmVnaW9uLmFtYXpvbmF3cy5jb21cIixcbiAgfSk7XG5cbmV4cG9ydCBjb25zdCBjcmVkZW50aWFscyA9ICgpID0+XG4gIFByb21pc2UucmVzb2x2ZSh7XG4gICAgYWNjZXNzS2V5SWQ6IFwiYWtpZFwiLFxuICAgIHNlY3JldEFjY2Vzc0tleTogXCJzZWNyZXRcIixcbiAgICBzZXNzaW9uVG9rZW46IFwic2Vzc2lvblwiLFxuICB9KTtcbiJdfQ==