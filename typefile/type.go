// type.goに利用する構造体をまとめる。
// 構造体の属性は必ず最初の文字を大文字にする。
// Winnerが必要になるかもしれない
package typefile

type User struct{
	ID             int            `gorm:"primaryKey"`
	Name           string         `gorm:"not null"`
}

type Client struct{
	User           User           `gorm:"embedded"`
}

type Engineer struct{
	User           User           `gorm:"embedded"`
	Requests       []Request      `gorm:"many2many:engineer_requests;"`
}

type Winner struct{
	User           User           `gorm:"embedded"`
	RequestID      int            `gorm:"not null"`
}

type Request struct{
	ID             int            `gorm:"primaryKey"`
	ClientID       int            `gorm:"not null"`
	Client         Client
	RequestName    string         `gorm:"not null"`
	Content        string         `gorm:"not null"`
	Winner         Winner
	Finish         bool           `gorm:"not null"`
}