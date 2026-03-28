package main

import (
	"crypto/rand"
	"crypto/sha1"
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/go-ldap/ldap/v3"
)

var frontendPath = getEnv("FRONTEND_PATH", "./frontend")

type SignupRequest struct {
	Username    string `json:"username"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	DisplayName string `json:"displayName"`
	Email       string `json:"email"`
	Password    string `json:"password"`
}

type SignupResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

var (
	lldapURL       = getEnvFile("LDAP_URL", "ldap://lldap:3890")
	lldapBaseDN    = getEnvFile("LDAP_BASE_DN", "dc=domain,dc=org")
	lldapUsersDN   = getEnvFile("LDAP_USERS_DN", "ou=people,dc=domain,dc=org")
	lldapAdminDN   = getEnvFile("LDAP_ADMIN_DN", "uid=admin,ou=people,dc=domain,dc=org")
	lldapAdminPass = getEnvFile("LDAP_ADMIN_PASSWORD", "")
	serverPort     = getEnvFile("SERVER_PORT", "8080")
)

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvFile(key, defaultValue string) string {
	filePath := os.Getenv(key + "_FILE")
	if filePath != "" {
		data, err := os.ReadFile(filePath)
		if err != nil {
			log.Printf("Warning: failed to read %s: %v", filePath, err)
			return defaultValue
		}
		return strings.TrimSpace(string(data))
	}
	return getEnv(key, defaultValue)
}

func hashSSHA(password string) string {
	salt := make([]byte, 4)
	rand.Read(salt)
	hash := sha1.Sum(append([]byte(password), salt...))
	return "{SSHA}" + base64.StdEncoding.EncodeToString(append(hash[:], salt...))
}

func signupHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		json.NewEncoder(w).Encode(SignupResponse{Success: false, Message: "Method not allowed"})
		return
	}

	var req SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(SignupResponse{Success: false, Message: "Invalid request body"})
		return
	}

	if req.Username == "" || req.Password == "" || req.Email == "" {
		json.NewEncoder(w).Encode(SignupResponse{Success: false, Message: "Username, email, and password are required"})
		return
	}

	conn, err := ldap.DialURL(lldapURL)
	if err != nil {
		log.Printf("Failed to connect to LDAP: %v", err)
		json.NewEncoder(w).Encode(SignupResponse{Success: false, Message: "Failed to connect to authentication server"})
		return
	}
	defer conn.Close()

	err = conn.Bind(lldapAdminDN, lldapAdminPass)
	if err != nil {
		log.Printf("Failed to bind as admin: %v", err)
		json.NewEncoder(w).Encode(SignupResponse{Success: false, Message: "Authentication server error"})
		return
	}

	searchReq := ldap.NewSearchRequest(
		lldapUsersDN,
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		"(uid="+ldap.EscapeFilter(req.Username)+")",
		[]string{"uid"},
		nil,
	)

	searchResult, err := conn.Search(searchReq)
	if err != nil {
		log.Printf("Failed to search: %v", err)
		json.NewEncoder(w).Encode(SignupResponse{Success: false, Message: "Failed to verify user"})
		return
	}

	if len(searchResult.Entries) > 0 {
		json.NewEncoder(w).Encode(SignupResponse{Success: false, Message: "Username already exists"})
		return
	}

	displayName := req.DisplayName
	if displayName == "" {
		if req.FirstName != "" || req.LastName != "" {
			displayName = strings.TrimSpace(req.FirstName + " " + req.LastName)
		} else {
			displayName = req.Username
		}
	}

	surname := req.LastName
	if surname == "" {
		surname = req.Username
	}

	addReq := ldap.NewAddRequest("uid="+req.Username+","+lldapUsersDN, nil)
	addReq.Attribute("objectClass", []string{"person", "inetOrgPerson", "ldapPublicKey"})
	addReq.Attribute("cn", []string{displayName})
	addReq.Attribute("sn", []string{surname})
	addReq.Attribute("givenName", []string{req.FirstName})
	addReq.Attribute("uid", []string{req.Username})
	addReq.Attribute("mail", []string{req.Email})
	addReq.Attribute("displayName", []string{displayName})
	addReq.Attribute("userPassword", []string{hashSSHA(req.Password)})

	err = conn.Add(addReq)
	if err != nil {
		log.Printf("Failed to add user: %v", err)
		json.NewEncoder(w).Encode(SignupResponse{Success: false, Message: "Failed to create account"})
		return
	}

	json.NewEncoder(w).Encode(SignupResponse{Success: true, Message: "Account created successfully"})
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func main() {
	fs := http.FileServer(http.Dir(frontendPath))
	http.Handle("/", fs)
	http.HandleFunc("/api/signup", signupHandler)
	http.HandleFunc("/health", healthHandler)

	log.Printf("Starting signup service on port %s", serverPort)
	log.Printf("Serving frontend from %s", frontendPath)
	if err := http.ListenAndServe(":"+serverPort, nil); err != nil {
		log.Fatal(err)
	}
}
