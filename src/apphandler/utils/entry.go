package utils

// Specify a new way to exlcude known used containers
// func GetPort(containers *[]Container) int {
// 	// Specify the valid port range
// 	portMin := 2000
// 	portMax := 65535

// 	// Get a sorted list of existing ports within the valid port range
// 	existingPorts := []int{}
// 	for _, ctr := range *containers {
// 		if ctr.Port >= portMin {
// 			existingPorts = append(existingPorts, ctr.Port)
// 		}
// 	}
// 	sort.Ints(existingPorts)

// 	// Generate a random port until it is correct
// 	for {
// 		// Generate a new random port within the range
// 		randPort := portMin + rand.Int()%(portMax-portMin+1)

// 		// Make sure that the port is not in the list of existing ports
// 		for _, existingPort := range existingPorts {
// 			if randPort < existingPort {
// 				break
// 			}
// 			randPort++
// 		}

// 		// Check that the port is not used by the rest of the system
// 		server, err := net.Listen("tcp", fmt.Sprintf(":%d", randPort))

// 		// If the server connected to the port it must be valid, so return it, otherwise continue
// 		if err == nil {
// 			server.Close()
// 			return randPort
// 		}
// 	}
// }
