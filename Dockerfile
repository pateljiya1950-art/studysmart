# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies first (layer-cache optimization)
COPY ["ReactApp1.Server/ReactApp1.Server.csproj", "ReactApp1.Server/"]
RUN dotnet restore "ReactApp1.Server/ReactApp1.Server.csproj"

# Copy everything else and build
COPY ReactApp1.Server/ ReactApp1.Server/
WORKDIR /src/ReactApp1.Server
RUN dotnet build "ReactApp1.Server.csproj" -c Release -o /app/build

# ── Stage 2: Publish ──────────────────────────────────────────────────────────
FROM build AS publish
RUN dotnet publish "ReactApp1.Server.csproj" -c Release -o /app/publish --no-restore

# ── Stage 3: Runtime ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy published output
COPY --from=publish /app/publish .

# Create wwwroot directory (for uploaded files served as static files)
RUN mkdir -p wwwroot/uploads

# Cloud platforms (Render, Railway, etc.) set PORT at runtime.
# ASP.NET Core reads ASPNETCORE_URLS or ASPNETCORE_HTTP_PORTS.
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_HTTP_PORTS=8080

# Expose port 8080 for Render Web Service routing
EXPOSE 8080

# Entry point
ENTRYPOINT ["dotnet", "ReactApp1.Server.dll"]
