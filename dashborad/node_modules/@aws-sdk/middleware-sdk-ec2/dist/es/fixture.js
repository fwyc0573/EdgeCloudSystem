var MockSha256 = /** @class */ (function () {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function MockSha256(secret) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MockSha256.prototype.update = function (data) { };
    MockSha256.prototype.digest = function () {
        return Promise.resolve(new Uint8Array(5));
    };
    return MockSha256;
}());
export { MockSha256 };
export var region = function () { return Promise.resolve("mock-region"); };
export var endpoint = function () {
    return Promise.resolve({
        protocol: "https:",
        path: "/",
        hostname: "ec2.mock-region.amazonaws.com",
    });
};
export var credentials = function () {
    return Promise.resolve({
        accessKeyId: "akid",
        secretAccessKey: "secret",
        sessionToken: "session",
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4dHVyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9maXh0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0lBQ0UsNkRBQTZEO0lBQzdELG9CQUFZLE1BQStDO0lBQUcsQ0FBQztJQUMvRCw2REFBNkQ7SUFDN0QsMkJBQU0sR0FBTixVQUFPLElBQWlCLElBQUcsQ0FBQztJQUM1QiwyQkFBTSxHQUFOO1FBQ0UsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNILGlCQUFDO0FBQUQsQ0FBQyxBQVJELElBUUM7O0FBRUQsTUFBTSxDQUFDLElBQU0sTUFBTSxHQUFHLGNBQU0sT0FBQSxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUE5QixDQUE4QixDQUFDO0FBRTNELE1BQU0sQ0FBQyxJQUFNLFFBQVEsR0FBRztJQUN0QixPQUFBLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDZCxRQUFRLEVBQUUsUUFBUTtRQUNsQixJQUFJLEVBQUUsR0FBRztRQUNULFFBQVEsRUFBRSwrQkFBK0I7S0FDMUMsQ0FBQztBQUpGLENBSUUsQ0FBQztBQUVMLE1BQU0sQ0FBQyxJQUFNLFdBQVcsR0FBRztJQUN6QixPQUFBLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDZCxXQUFXLEVBQUUsTUFBTTtRQUNuQixlQUFlLEVBQUUsUUFBUTtRQUN6QixZQUFZLEVBQUUsU0FBUztLQUN4QixDQUFDO0FBSkYsQ0FJRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU291cmNlRGF0YSB9IGZyb20gXCJAYXdzLXNkay90eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgTW9ja1NoYTI1NiB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgY29uc3RydWN0b3Ioc2VjcmV0Pzogc3RyaW5nIHwgQXJyYXlCdWZmZXIgfCBBcnJheUJ1ZmZlclZpZXcpIHt9XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgdXBkYXRlKGRhdGE/OiBTb3VyY2VEYXRhKSB7fVxuICBkaWdlc3QoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgVWludDhBcnJheSg1KSk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHJlZ2lvbiA9ICgpID0+IFByb21pc2UucmVzb2x2ZShcIm1vY2stcmVnaW9uXCIpO1xuXG5leHBvcnQgY29uc3QgZW5kcG9pbnQgPSAoKSA9PlxuICBQcm9taXNlLnJlc29sdmUoe1xuICAgIHByb3RvY29sOiBcImh0dHBzOlwiLFxuICAgIHBhdGg6IFwiL1wiLFxuICAgIGhvc3RuYW1lOiBcImVjMi5tb2NrLXJlZ2lvbi5hbWF6b25hd3MuY29tXCIsXG4gIH0pO1xuXG5leHBvcnQgY29uc3QgY3JlZGVudGlhbHMgPSAoKSA9PlxuICBQcm9taXNlLnJlc29sdmUoe1xuICAgIGFjY2Vzc0tleUlkOiBcImFraWRcIixcbiAgICBzZWNyZXRBY2Nlc3NLZXk6IFwic2VjcmV0XCIsXG4gICAgc2Vzc2lvblRva2VuOiBcInNlc3Npb25cIixcbiAgfSk7XG4iXX0=