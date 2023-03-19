import { __assign, __awaiter, __generator, __read, __spread } from "tslib";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { SPACE, UA_ESCAPE_REGEX, USER_AGENT, X_AMZ_USER_AGENT } from "./constants";
/**
 * Build user agent header sections from:
 * 1. runtime-specific default user agent provider;
 * 2. custom user agent from `customUserAgent` client config;
 * 3. handler execution context set by internal SDK components;
 * The built user agent will be set to `x-amz-user-agent` header for ALL the
 * runtimes.
 * Please note that any override to the `user-agent` or `x-amz-user-agent` header
 * in the HTTP request is discouraged. Please use `customUserAgent` client
 * config or middleware setting the `userAgent` context to generate desired user
 * agent.
 */
export var userAgentMiddleware = function (options) { return function (next, context) { return function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var request, headers, userAgent, defaultUserAgent, customUserAgent, normalUAValue;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                request = args.request;
                if (!HttpRequest.isInstance(request))
                    return [2 /*return*/, next(args)];
                headers = request.headers;
                userAgent = ((_a = context === null || context === void 0 ? void 0 : context.userAgent) === null || _a === void 0 ? void 0 : _a.map(escapeUserAgent)) || [];
                return [4 /*yield*/, options.defaultUserAgentProvider()];
            case 1:
                defaultUserAgent = (_c.sent()).map(escapeUserAgent);
                customUserAgent = ((_b = options === null || options === void 0 ? void 0 : options.customUserAgent) === null || _b === void 0 ? void 0 : _b.map(escapeUserAgent)) || [];
                // Set value to AWS-specific user agent header
                headers[X_AMZ_USER_AGENT] = __spread(defaultUserAgent, userAgent, customUserAgent).join(SPACE);
                normalUAValue = __spread(defaultUserAgent.filter(function (section) { return section.startsWith("aws-sdk-"); }), customUserAgent).join(SPACE);
                if (options.runtime !== "browser" && normalUAValue) {
                    headers[USER_AGENT] = headers[USER_AGENT] ? headers[USER_AGENT] + " " + normalUAValue : normalUAValue;
                }
                return [2 /*return*/, next(__assign(__assign({}, args), { request: request }))];
        }
    });
}); }; }; };
/**
 * Escape the each pair according to https://tools.ietf.org/html/rfc5234 and join the pair with pattern `name/version`.
 * User agent name may include prefix like `md/`, `api/`, `os/` etc., we should not escape the `/` after the prefix.
 * @private
 */
var escapeUserAgent = function (_a) {
    var _b = __read(_a, 2), name = _b[0], version = _b[1];
    var prefixSeparatorIndex = name.indexOf("/");
    var prefix = name.substring(0, prefixSeparatorIndex); // If no prefix, prefix is just ""
    var uaName = name.substring(prefixSeparatorIndex + 1);
    if (prefix === "api") {
        uaName = uaName.toLowerCase();
    }
    return [prefix, uaName, version]
        .filter(function (item) { return item && item.length > 0; })
        .map(function (item) { return item === null || item === void 0 ? void 0 : item.replace(UA_ESCAPE_REGEX, "_"); })
        .join("/");
};
export var getUserAgentMiddlewareOptions = {
    name: "getUserAgentMiddleware",
    step: "build",
    priority: "low",
    tags: ["SET_USER_AGENT", "USER_AGENT"],
};
export var getUserAgentPlugin = function (config) { return ({
    applyToStack: function (clientStack) {
        clientStack.add(userAgentMiddleware(config), getUserAgentMiddlewareOptions);
    },
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1hZ2VudC1taWRkbGV3YXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3VzZXItYWdlbnQtbWlkZGxld2FyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBY3JELE9BQU8sRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUVuRjs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sQ0FBQyxJQUFNLG1CQUFtQixHQUFHLFVBQUMsT0FBZ0MsSUFBSyxPQUFBLFVBQ3ZFLElBQTRCLEVBQzVCLE9BQWdDLElBQ0wsT0FBQSxVQUFPLElBQWdDOzs7Ozs7Z0JBQzFELE9BQU8sR0FBSyxJQUFJLFFBQVQsQ0FBVTtnQkFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDO29CQUFFLHNCQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQztnQkFDaEQsT0FBTyxHQUFLLE9BQU8sUUFBWixDQUFhO2dCQUN0QixTQUFTLEdBQUcsT0FBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsU0FBUywwQ0FBRSxHQUFHLENBQUMsZUFBZSxNQUFLLEVBQUUsQ0FBQztnQkFDdkMscUJBQU0sT0FBTyxDQUFDLHdCQUF3QixFQUFFLEVBQUE7O2dCQUE1RCxnQkFBZ0IsR0FBRyxDQUFDLFNBQXdDLENBQUMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDO2dCQUNsRixlQUFlLEdBQUcsT0FBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsZUFBZSwwQ0FBRSxHQUFHLENBQUMsZUFBZSxNQUFLLEVBQUUsQ0FBQztnQkFDN0UsOENBQThDO2dCQUM5QyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxTQUFJLGdCQUFnQixFQUFLLFNBQVMsRUFBSyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUUxRixhQUFhLEdBQUcsU0FDakIsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFVBQUMsT0FBTyxJQUFLLE9BQUEsT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBOUIsQ0FBOEIsQ0FBQyxFQUNwRSxlQUFlLEVBQ2xCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDZCxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLGFBQWEsRUFBRTtvQkFDbEQsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFJLGFBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO2lCQUN2RztnQkFFRCxzQkFBTyxJQUFJLHVCQUNOLElBQUksS0FDUCxPQUFPLFNBQUEsSUFDUCxFQUFDOzs7S0FDSixFQXRCNEIsQ0FzQjVCLEVBekJ3RSxDQXlCeEUsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxJQUFNLGVBQWUsR0FBRyxVQUFDLEVBQThCO1FBQTlCLEtBQUEsYUFBOEIsRUFBN0IsSUFBSSxRQUFBLEVBQUUsT0FBTyxRQUFBO0lBQ3JDLElBQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvQyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsa0NBQWtDO0lBQzFGLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdEQsSUFBSSxNQUFNLEtBQUssS0FBSyxFQUFFO1FBQ3BCLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDL0I7SUFDRCxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUM7U0FDN0IsTUFBTSxDQUFDLFVBQUMsSUFBSSxJQUFLLE9BQUEsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUF2QixDQUF1QixDQUFDO1NBQ3pDLEdBQUcsQ0FBQyxVQUFDLElBQUksV0FBSyxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsT0FBTyxDQUFDLGVBQWUsRUFBRSxHQUFHLElBQUMsQ0FBQztTQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDZixDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSw2QkFBNkIsR0FBMkM7SUFDbkYsSUFBSSxFQUFFLHdCQUF3QjtJQUM5QixJQUFJLEVBQUUsT0FBTztJQUNiLFFBQVEsRUFBRSxLQUFLO0lBQ2YsSUFBSSxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxDQUFDO0NBQ3ZDLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSxrQkFBa0IsR0FBRyxVQUFDLE1BQStCLElBQTBCLE9BQUEsQ0FBQztJQUMzRixZQUFZLEVBQUUsVUFBQyxXQUFXO1FBQ3hCLFdBQVcsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztJQUM5RSxDQUFDO0NBQ0YsQ0FBQyxFQUowRixDQUkxRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cFJlcXVlc3QgfSBmcm9tIFwiQGF3cy1zZGsvcHJvdG9jb2wtaHR0cFwiO1xuaW1wb3J0IHtcbiAgQWJzb2x1dGVMb2NhdGlvbixcbiAgQnVpbGRIYW5kbGVyLFxuICBCdWlsZEhhbmRsZXJBcmd1bWVudHMsXG4gIEJ1aWxkSGFuZGxlck9wdGlvbnMsXG4gIEJ1aWxkSGFuZGxlck91dHB1dCxcbiAgSGFuZGxlckV4ZWN1dGlvbkNvbnRleHQsXG4gIE1ldGFkYXRhQmVhcmVyLFxuICBQbHVnZ2FibGUsXG4gIFVzZXJBZ2VudFBhaXIsXG59IGZyb20gXCJAYXdzLXNkay90eXBlc1wiO1xuXG5pbXBvcnQgeyBVc2VyQWdlbnRSZXNvbHZlZENvbmZpZyB9IGZyb20gXCIuL2NvbmZpZ3VyYXRpb25zXCI7XG5pbXBvcnQgeyBTUEFDRSwgVUFfRVNDQVBFX1JFR0VYLCBVU0VSX0FHRU5ULCBYX0FNWl9VU0VSX0FHRU5UIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5cbi8qKlxuICogQnVpbGQgdXNlciBhZ2VudCBoZWFkZXIgc2VjdGlvbnMgZnJvbTpcbiAqIDEuIHJ1bnRpbWUtc3BlY2lmaWMgZGVmYXVsdCB1c2VyIGFnZW50IHByb3ZpZGVyO1xuICogMi4gY3VzdG9tIHVzZXIgYWdlbnQgZnJvbSBgY3VzdG9tVXNlckFnZW50YCBjbGllbnQgY29uZmlnO1xuICogMy4gaGFuZGxlciBleGVjdXRpb24gY29udGV4dCBzZXQgYnkgaW50ZXJuYWwgU0RLIGNvbXBvbmVudHM7XG4gKiBUaGUgYnVpbHQgdXNlciBhZ2VudCB3aWxsIGJlIHNldCB0byBgeC1hbXotdXNlci1hZ2VudGAgaGVhZGVyIGZvciBBTEwgdGhlXG4gKiBydW50aW1lcy5cbiAqIFBsZWFzZSBub3RlIHRoYXQgYW55IG92ZXJyaWRlIHRvIHRoZSBgdXNlci1hZ2VudGAgb3IgYHgtYW16LXVzZXItYWdlbnRgIGhlYWRlclxuICogaW4gdGhlIEhUVFAgcmVxdWVzdCBpcyBkaXNjb3VyYWdlZC4gUGxlYXNlIHVzZSBgY3VzdG9tVXNlckFnZW50YCBjbGllbnRcbiAqIGNvbmZpZyBvciBtaWRkbGV3YXJlIHNldHRpbmcgdGhlIGB1c2VyQWdlbnRgIGNvbnRleHQgdG8gZ2VuZXJhdGUgZGVzaXJlZCB1c2VyXG4gKiBhZ2VudC5cbiAqL1xuZXhwb3J0IGNvbnN0IHVzZXJBZ2VudE1pZGRsZXdhcmUgPSAob3B0aW9uczogVXNlckFnZW50UmVzb2x2ZWRDb25maWcpID0+IDxPdXRwdXQgZXh0ZW5kcyBNZXRhZGF0YUJlYXJlcj4oXG4gIG5leHQ6IEJ1aWxkSGFuZGxlcjxhbnksIGFueT4sXG4gIGNvbnRleHQ6IEhhbmRsZXJFeGVjdXRpb25Db250ZXh0XG4pOiBCdWlsZEhhbmRsZXI8YW55LCBhbnk+ID0+IGFzeW5jIChhcmdzOiBCdWlsZEhhbmRsZXJBcmd1bWVudHM8YW55Pik6IFByb21pc2U8QnVpbGRIYW5kbGVyT3V0cHV0PE91dHB1dD4+ID0+IHtcbiAgY29uc3QgeyByZXF1ZXN0IH0gPSBhcmdzO1xuICBpZiAoIUh0dHBSZXF1ZXN0LmlzSW5zdGFuY2UocmVxdWVzdCkpIHJldHVybiBuZXh0KGFyZ3MpO1xuICBjb25zdCB7IGhlYWRlcnMgfSA9IHJlcXVlc3Q7XG4gIGNvbnN0IHVzZXJBZ2VudCA9IGNvbnRleHQ/LnVzZXJBZ2VudD8ubWFwKGVzY2FwZVVzZXJBZ2VudCkgfHwgW107XG4gIGNvbnN0IGRlZmF1bHRVc2VyQWdlbnQgPSAoYXdhaXQgb3B0aW9ucy5kZWZhdWx0VXNlckFnZW50UHJvdmlkZXIoKSkubWFwKGVzY2FwZVVzZXJBZ2VudCk7XG4gIGNvbnN0IGN1c3RvbVVzZXJBZ2VudCA9IG9wdGlvbnM/LmN1c3RvbVVzZXJBZ2VudD8ubWFwKGVzY2FwZVVzZXJBZ2VudCkgfHwgW107XG4gIC8vIFNldCB2YWx1ZSB0byBBV1Mtc3BlY2lmaWMgdXNlciBhZ2VudCBoZWFkZXJcbiAgaGVhZGVyc1tYX0FNWl9VU0VSX0FHRU5UXSA9IFsuLi5kZWZhdWx0VXNlckFnZW50LCAuLi51c2VyQWdlbnQsIC4uLmN1c3RvbVVzZXJBZ2VudF0uam9pbihTUEFDRSk7XG4gIC8vIEdldCB2YWx1ZSB0byBiZSBzZW50IHdpdGggbm9uLUFXUy1zcGVjaWZpYyB1c2VyIGFnZW50IGhlYWRlci5cbiAgY29uc3Qgbm9ybWFsVUFWYWx1ZSA9IFtcbiAgICAuLi5kZWZhdWx0VXNlckFnZW50LmZpbHRlcigoc2VjdGlvbikgPT4gc2VjdGlvbi5zdGFydHNXaXRoKFwiYXdzLXNkay1cIikpLFxuICAgIC4uLmN1c3RvbVVzZXJBZ2VudCxcbiAgXS5qb2luKFNQQUNFKTtcbiAgaWYgKG9wdGlvbnMucnVudGltZSAhPT0gXCJicm93c2VyXCIgJiYgbm9ybWFsVUFWYWx1ZSkge1xuICAgIGhlYWRlcnNbVVNFUl9BR0VOVF0gPSBoZWFkZXJzW1VTRVJfQUdFTlRdID8gYCR7aGVhZGVyc1tVU0VSX0FHRU5UXX0gJHtub3JtYWxVQVZhbHVlfWAgOiBub3JtYWxVQVZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIG5leHQoe1xuICAgIC4uLmFyZ3MsXG4gICAgcmVxdWVzdCxcbiAgfSk7XG59O1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgZWFjaCBwYWlyIGFjY29yZGluZyB0byBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNTIzNCBhbmQgam9pbiB0aGUgcGFpciB3aXRoIHBhdHRlcm4gYG5hbWUvdmVyc2lvbmAuXG4gKiBVc2VyIGFnZW50IG5hbWUgbWF5IGluY2x1ZGUgcHJlZml4IGxpa2UgYG1kL2AsIGBhcGkvYCwgYG9zL2AgZXRjLiwgd2Ugc2hvdWxkIG5vdCBlc2NhcGUgdGhlIGAvYCBhZnRlciB0aGUgcHJlZml4LlxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgZXNjYXBlVXNlckFnZW50ID0gKFtuYW1lLCB2ZXJzaW9uXTogVXNlckFnZW50UGFpcik6IHN0cmluZyA9PiB7XG4gIGNvbnN0IHByZWZpeFNlcGFyYXRvckluZGV4ID0gbmFtZS5pbmRleE9mKFwiL1wiKTtcbiAgY29uc3QgcHJlZml4ID0gbmFtZS5zdWJzdHJpbmcoMCwgcHJlZml4U2VwYXJhdG9ySW5kZXgpOyAvLyBJZiBubyBwcmVmaXgsIHByZWZpeCBpcyBqdXN0IFwiXCJcbiAgbGV0IHVhTmFtZSA9IG5hbWUuc3Vic3RyaW5nKHByZWZpeFNlcGFyYXRvckluZGV4ICsgMSk7XG4gIGlmIChwcmVmaXggPT09IFwiYXBpXCIpIHtcbiAgICB1YU5hbWUgPSB1YU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgfVxuICByZXR1cm4gW3ByZWZpeCwgdWFOYW1lLCB2ZXJzaW9uXVxuICAgIC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gJiYgaXRlbS5sZW5ndGggPiAwKVxuICAgIC5tYXAoKGl0ZW0pID0+IGl0ZW0/LnJlcGxhY2UoVUFfRVNDQVBFX1JFR0VYLCBcIl9cIikpXG4gICAgLmpvaW4oXCIvXCIpO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFVzZXJBZ2VudE1pZGRsZXdhcmVPcHRpb25zOiBCdWlsZEhhbmRsZXJPcHRpb25zICYgQWJzb2x1dGVMb2NhdGlvbiA9IHtcbiAgbmFtZTogXCJnZXRVc2VyQWdlbnRNaWRkbGV3YXJlXCIsXG4gIHN0ZXA6IFwiYnVpbGRcIixcbiAgcHJpb3JpdHk6IFwibG93XCIsXG4gIHRhZ3M6IFtcIlNFVF9VU0VSX0FHRU5UXCIsIFwiVVNFUl9BR0VOVFwiXSxcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRVc2VyQWdlbnRQbHVnaW4gPSAoY29uZmlnOiBVc2VyQWdlbnRSZXNvbHZlZENvbmZpZyk6IFBsdWdnYWJsZTxhbnksIGFueT4gPT4gKHtcbiAgYXBwbHlUb1N0YWNrOiAoY2xpZW50U3RhY2spID0+IHtcbiAgICBjbGllbnRTdGFjay5hZGQodXNlckFnZW50TWlkZGxld2FyZShjb25maWcpLCBnZXRVc2VyQWdlbnRNaWRkbGV3YXJlT3B0aW9ucyk7XG4gIH0sXG59KTtcbiJdfQ==