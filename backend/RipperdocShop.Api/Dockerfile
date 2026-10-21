FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["backend/RipperdocShop.Api/RipperdocShop.Api.csproj", "backend/RipperdocShop.Api/"]
COPY ["backend/RipperdocShop.Shared/RipperdocShop.Shared.csproj", "backend/RipperdocShop.Shared/"]
RUN dotnet restore "backend/RipperdocShop.Api/RipperdocShop.Api.csproj"
COPY . .
WORKDIR "/src/backend/RipperdocShop.Api"
RUN dotnet build "./RipperdocShop.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
ARG TARGETARCH
RUN arch="$TARGETARCH" && \
    if [ "$arch" = "amd64" ]; then arch="x64"; fi && \
    dotnet publish "./RipperdocShop.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish -a "$arch" /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "RipperdocShop.Api.dll"]
