import { useEffect, useRef, useState } from 'react'

// Variable global para controlar la carga de Google Maps
let googleMapsLoaded = false
let googleMapsLoading = false

const SimpleMap = ({ emergencies }) => {
  const mapRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [map, setMap] = useState(null)

  useEffect(() => {
    let isMounted = true

    const initMap = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        if (isMounted) {
          setError('API key no encontrada')
          setLoading(false)
        }
        return
      }

      // Si ya está cargado, crear el mapa directamente
      if (googleMapsLoaded && window.google && window.google.maps) {
        createMap()
        return
      }

      // Si ya se está cargando, esperar
      if (googleMapsLoading) {
        const checkLoaded = setInterval(() => {
          if (googleMapsLoaded && window.google && window.google.maps) {
            clearInterval(checkLoaded)
            if (isMounted) {
              createMap()
            }
          }
        }, 100)

        setTimeout(() => {
          clearInterval(checkLoaded)
        }, 10000)

        return
      }

      // Marcar como cargando
      googleMapsLoading = true

      // Limpiar scripts existentes
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
      existingScripts.forEach(script => script.remove())

      // Cargar Google Maps
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        googleMapsLoaded = true
        googleMapsLoading = false
        if (isMounted) {
          console.log('Google Maps loaded successfully')
          createMap()
        }
      }
      
      script.onerror = () => {
        googleMapsLoading = false
        if (isMounted) {
          console.error('Error loading Google Maps')
          setError('Error al cargar Google Maps')
          setLoading(false)
        }
      }
      
      document.head.appendChild(script)
    }

    const createMap = () => {
      if (!isMounted || !mapRef.current || !window.google || !window.google.maps) {
        return
      }

      try {
        console.log('Creating map instance...')
        
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: -34.6037, lng: -58.3816 },
          zoom: 12
        })
        
        console.log('Map created successfully')
        
        if (isMounted) {
          setMap(mapInstance)
          setLoading(false)
          
          // Agregar marcadores después de un delay
          setTimeout(() => {
            if (isMounted) {
              addMarkers(mapInstance)
            }
          }, 1000)
        }
        
      } catch (err) {
        console.error('Error creating map:', err)
        if (isMounted) {
          setError(`Error al crear el mapa: ${err.message}`)
          setLoading(false)
        }
      }
    }

    const addMarkers = (mapInstance) => {
      if (!isMounted || !mapInstance || !window.google || !window.google.maps) return

      emergencies.forEach(emergency => {
        if (emergency.coordenadas && emergency.coordenadas.lat && emergency.coordenadas.lng) {
          try {
            const marker = new window.google.maps.Marker({
              position: emergency.coordenadas,
              map: mapInstance,
              title: `${emergency.tipo} - ${emergency.estado}`,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: emergency.prioridad === 'High' ? '#ef4444' : '#3b82f6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
              }
            })

            // Agregar ventana de información
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 8px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${emergency.tipo}</h3>
                  <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Estado:</strong> ${emergency.estado}</p>
                  <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Prioridad:</strong> ${emergency.prioridad}</p>
                  <p style="margin: 0; font-size: 12px;"><strong>Ubicación:</strong> ${emergency.ubicacion}</p>
                </div>
              `
            })

            marker.addListener('click', () => {
              infoWindow.open(mapInstance, marker)
            })
          } catch (err) {
            console.error('Error creating marker:', err)
          }
        }
      })
    }

    // Timeout para evitar carga infinita
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        setError('Timeout: El mapa tardó demasiado en cargar')
        setLoading(false)
      }
    }, 20000)

    initMap()
    
    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [emergencies])

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-red-500 mb-2 text-2xl">⚠️</div>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}

export default SimpleMap
