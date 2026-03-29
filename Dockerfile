# ── Stage 1: Build React ──────────────────────────────────────────────────
FROM node:20-alpine AS react-build
WORKDIR /react
COPY prosight-client/package*.json ./
RUN npm ci --silent
COPY prosight-client/ ./
RUN npm run build

# ── Stage 2: Build .NET API ───────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-build
WORKDIR /src
COPY ProSight.API/ ./
RUN dotnet publish -c Release -o /publish

# ── Stage 3: Runtime image ────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy API
COPY --from=dotnet-build /publish ./

# Copy React build into wwwroot so .NET serves it
COPY --from=react-build /react/build ./wwwroot

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "ProSight.API.dll"]
