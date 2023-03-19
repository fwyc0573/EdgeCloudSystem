import { __awaiter, __generator, __rest } from "tslib";
export var loggerMiddleware = function () { return function (next, context) { return function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var clientName, commandName, inputFilterSensitiveLog, logger, outputFilterSensitiveLog, response, _a, $metadata, outputWithoutMetadata;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                clientName = context.clientName, commandName = context.commandName, inputFilterSensitiveLog = context.inputFilterSensitiveLog, logger = context.logger, outputFilterSensitiveLog = context.outputFilterSensitiveLog;
                return [4 /*yield*/, next(args)];
            case 1:
                response = _b.sent();
                if (!logger) {
                    return [2 /*return*/, response];
                }
                if (typeof logger.info === "function") {
                    _a = response.output, $metadata = _a.$metadata, outputWithoutMetadata = __rest(_a, ["$metadata"]);
                    logger.info({
                        clientName: clientName,
                        commandName: commandName,
                        input: inputFilterSensitiveLog(args.input),
                        output: outputFilterSensitiveLog(outputWithoutMetadata),
                        metadata: $metadata,
                    });
                }
                return [2 /*return*/, response];
        }
    });
}); }; }; };
export var loggerMiddlewareOptions = {
    name: "loggerMiddleware",
    tags: ["LOGGER"],
    step: "initialize",
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export var getLoggerPlugin = function (options) { return ({
    applyToStack: function (clientStack) {
        clientStack.add(loggerMiddleware(), loggerMiddlewareOptions);
    },
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyTWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2dnZXJNaWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFZQSxNQUFNLENBQUMsSUFBTSxnQkFBZ0IsR0FBRyxjQUFNLE9BQUEsVUFDcEMsSUFBb0MsRUFDcEMsT0FBZ0MsSUFDRyxPQUFBLFVBQ25DLElBQXFDOzs7OztnQkFFN0IsVUFBVSxHQUE2RSxPQUFPLFdBQXBGLEVBQUUsV0FBVyxHQUFnRSxPQUFPLFlBQXZFLEVBQUUsdUJBQXVCLEdBQXVDLE9BQU8sd0JBQTlDLEVBQUUsTUFBTSxHQUErQixPQUFPLE9BQXRDLEVBQUUsd0JBQXdCLEdBQUssT0FBTyx5QkFBWixDQUFhO2dCQUV0RixxQkFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUE7O2dCQUEzQixRQUFRLEdBQUcsU0FBZ0I7Z0JBRWpDLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ1gsc0JBQU8sUUFBUSxFQUFDO2lCQUNqQjtnQkFFRCxJQUFJLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7b0JBQy9CLEtBQTBDLFFBQVEsQ0FBQyxNQUFNLEVBQXZELFNBQVMsZUFBQSxFQUFLLHFCQUFxQixjQUFyQyxhQUF1QyxDQUFGLENBQXFCO29CQUNoRSxNQUFNLENBQUMsSUFBSSxDQUFDO3dCQUNWLFVBQVUsWUFBQTt3QkFDVixXQUFXLGFBQUE7d0JBQ1gsS0FBSyxFQUFFLHVCQUF1QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7d0JBQzFDLE1BQU0sRUFBRSx3QkFBd0IsQ0FBQyxxQkFBcUIsQ0FBQzt3QkFDdkQsUUFBUSxFQUFFLFNBQVM7cUJBQ3BCLENBQUMsQ0FBQztpQkFDSjtnQkFFRCxzQkFBTyxRQUFRLEVBQUM7OztLQUNqQixFQXZCb0MsQ0F1QnBDLEVBMUJxQyxDQTBCckMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxJQUFNLHVCQUF1QixHQUFnRDtJQUNsRixJQUFJLEVBQUUsa0JBQWtCO0lBQ3hCLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQztJQUNoQixJQUFJLEVBQUUsWUFBWTtDQUNuQixDQUFDO0FBRUYsNkRBQTZEO0FBQzdELE1BQU0sQ0FBQyxJQUFNLGVBQWUsR0FBRyxVQUFDLE9BQVksSUFBMEIsT0FBQSxDQUFDO0lBQ3JFLFlBQVksRUFBRSxVQUFDLFdBQVc7UUFDeEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDL0QsQ0FBQztDQUNGLENBQUMsRUFKb0UsQ0FJcEUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBSZXNwb25zZSB9IGZyb20gXCJAYXdzLXNkay9wcm90b2NvbC1odHRwXCI7XG5pbXBvcnQge1xuICBBYnNvbHV0ZUxvY2F0aW9uLFxuICBIYW5kbGVyRXhlY3V0aW9uQ29udGV4dCxcbiAgSW5pdGlhbGl6ZUhhbmRsZXIsXG4gIEluaXRpYWxpemVIYW5kbGVyQXJndW1lbnRzLFxuICBJbml0aWFsaXplSGFuZGxlck9wdGlvbnMsXG4gIEluaXRpYWxpemVIYW5kbGVyT3V0cHV0LFxuICBNZXRhZGF0YUJlYXJlcixcbiAgUGx1Z2dhYmxlLFxufSBmcm9tIFwiQGF3cy1zZGsvdHlwZXNcIjtcblxuZXhwb3J0IGNvbnN0IGxvZ2dlck1pZGRsZXdhcmUgPSAoKSA9PiA8T3V0cHV0IGV4dGVuZHMgTWV0YWRhdGFCZWFyZXIgPSBNZXRhZGF0YUJlYXJlcj4oXG4gIG5leHQ6IEluaXRpYWxpemVIYW5kbGVyPGFueSwgT3V0cHV0PixcbiAgY29udGV4dDogSGFuZGxlckV4ZWN1dGlvbkNvbnRleHRcbik6IEluaXRpYWxpemVIYW5kbGVyPGFueSwgT3V0cHV0PiA9PiBhc3luYyAoXG4gIGFyZ3M6IEluaXRpYWxpemVIYW5kbGVyQXJndW1lbnRzPGFueT5cbik6IFByb21pc2U8SW5pdGlhbGl6ZUhhbmRsZXJPdXRwdXQ8T3V0cHV0Pj4gPT4ge1xuICBjb25zdCB7IGNsaWVudE5hbWUsIGNvbW1hbmROYW1lLCBpbnB1dEZpbHRlclNlbnNpdGl2ZUxvZywgbG9nZ2VyLCBvdXRwdXRGaWx0ZXJTZW5zaXRpdmVMb2cgfSA9IGNvbnRleHQ7XG5cbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBuZXh0KGFyZ3MpO1xuXG4gIGlmICghbG9nZ2VyKSB7XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBsb2dnZXIuaW5mbyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgY29uc3QgeyAkbWV0YWRhdGEsIC4uLm91dHB1dFdpdGhvdXRNZXRhZGF0YSB9ID0gcmVzcG9uc2Uub3V0cHV0O1xuICAgIGxvZ2dlci5pbmZvKHtcbiAgICAgIGNsaWVudE5hbWUsXG4gICAgICBjb21tYW5kTmFtZSxcbiAgICAgIGlucHV0OiBpbnB1dEZpbHRlclNlbnNpdGl2ZUxvZyhhcmdzLmlucHV0KSxcbiAgICAgIG91dHB1dDogb3V0cHV0RmlsdGVyU2Vuc2l0aXZlTG9nKG91dHB1dFdpdGhvdXRNZXRhZGF0YSksXG4gICAgICBtZXRhZGF0YTogJG1ldGFkYXRhLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlc3BvbnNlO1xufTtcblxuZXhwb3J0IGNvbnN0IGxvZ2dlck1pZGRsZXdhcmVPcHRpb25zOiBJbml0aWFsaXplSGFuZGxlck9wdGlvbnMgJiBBYnNvbHV0ZUxvY2F0aW9uID0ge1xuICBuYW1lOiBcImxvZ2dlck1pZGRsZXdhcmVcIixcbiAgdGFnczogW1wiTE9HR0VSXCJdLFxuICBzdGVwOiBcImluaXRpYWxpemVcIixcbn07XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbmV4cG9ydCBjb25zdCBnZXRMb2dnZXJQbHVnaW4gPSAob3B0aW9uczogYW55KTogUGx1Z2dhYmxlPGFueSwgYW55PiA9PiAoe1xuICBhcHBseVRvU3RhY2s6IChjbGllbnRTdGFjaykgPT4ge1xuICAgIGNsaWVudFN0YWNrLmFkZChsb2dnZXJNaWRkbGV3YXJlKCksIGxvZ2dlck1pZGRsZXdhcmVPcHRpb25zKTtcbiAgfSxcbn0pO1xuIl19