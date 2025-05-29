export interface Mapbox {
    display_name: string
    lat: string
    lon: string
    address: {
        city?: string
        state?: string
        [k: string]: any
    }
    place_id: number
    type: string
}